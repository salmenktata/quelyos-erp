#!/bin/bash
# Déploiement automatique vers VPS Contabo (184.174.32.177)

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

VPS_HOST="quelyos-vps"
VPS_IP="184.174.32.177"
VPS_USER="deploy"
DOMAIN="quelyos.com"

echo -e "${GREEN}=== Déploiement Quelyos Suite vers Contabo VPS ===${NC}"
echo -e "VPS: ${YELLOW}${VPS_IP}${NC}"
echo -e "Domaine: ${YELLOW}${DOMAIN}${NC}"
echo ""

# Vérifier connexion SSH
echo -e "${YELLOW}🔍 Vérification connexion SSH...${NC}"
if ! ssh -o ConnectTimeout=5 ${VPS_HOST} "echo 'OK'" &>/dev/null; then
    echo -e "${RED}❌ Impossible de se connecter au VPS${NC}"
    echo "Vérifier: ssh ${VPS_HOST}"
    exit 1
fi
echo -e "${GREEN}✅ Connexion SSH OK${NC}"
echo ""

# Vérifier K3s installé
echo -e "${YELLOW}🔍 Vérification K3s...${NC}"
if ! ssh ${VPS_HOST} "sudo kubectl version --short" &>/dev/null; then
    echo -e "${YELLOW}⚠️  K3s non installé, installation...${NC}"

    # Copier et exécuter script d'installation
    scp scripts/contabo-k3s-install.sh ${VPS_HOST}:/tmp/
    ssh ${VPS_HOST} "sudo bash /tmp/contabo-k3s-install.sh"

    echo ""
    echo -e "${GREEN}✅ K3s installé${NC}"
else
    echo -e "${GREEN}✅ K3s déjà installé${NC}"
fi
echo ""

# Récupérer kubeconfig
echo -e "${YELLOW}📥 Récupération kubeconfig...${NC}"
ssh ${VPS_HOST} "sudo cat /etc/rancher/k3s/k3s.yaml" > /tmp/k3s-config.yaml
sed -i.bak "s/127.0.0.1/${VPS_IP}/g" /tmp/k3s-config.yaml
export KUBECONFIG=/tmp/k3s-config.yaml

# Vérifier connexion kubectl
if ! kubectl get nodes &>/dev/null; then
    echo -e "${RED}❌ Impossible de se connecter au cluster K3s${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Connexion kubectl OK${NC}"
echo ""

# Build images Docker
echo -e "${YELLOW}🐳 Build images Docker...${NC}"
read -p "Build nouvelles images ? (o/N): " BUILD_IMAGES
if [[ "$BUILD_IMAGES" =~ ^[Oo]$ ]]; then
    ./scripts/docker-build-local.sh

    # Tag et push vers GHCR
    echo -e "${YELLOW}📤 Push vers GitHub Container Registry...${NC}"

    GITHUB_USER=$(git config user.name | tr '[:upper:]' '[:lower:]')
    TAG=$(git rev-parse --short HEAD)

    docker tag quelyos/backend:latest ghcr.io/${GITHUB_USER}/quelyos/backend:${TAG}
    docker tag quelyos/vitrine-quelyos:latest ghcr.io/${GITHUB_USER}/quelyos/vitrine-quelyos:${TAG}
    docker tag quelyos/vitrine-client:latest ghcr.io/${GITHUB_USER}/quelyos/vitrine-client:${TAG}
    docker tag quelyos/dashboard-client:latest ghcr.io/${GITHUB_USER}/quelyos/dashboard-client:${TAG}

    echo "Login GHCR requis (utiliser GITHUB_TOKEN avec permissions packages:write)"
    read -p "Continuer push GHCR ? (o/N): " PUSH_GHCR
    if [[ "$PUSH_GHCR" =~ ^[Oo]$ ]]; then
        docker push ghcr.io/${GITHUB_USER}/quelyos/backend:${TAG}
        docker push ghcr.io/${GITHUB_USER}/quelyos/vitrine-quelyos:${TAG}
        docker push ghcr.io/${GITHUB_USER}/quelyos/vitrine-client:${TAG}
        docker push ghcr.io/${GITHUB_USER}/quelyos/dashboard-client:${TAG}

        # Mettre à jour les images dans manifests
        sed -i.bak "s|image: quelyos/backend:.*|image: ghcr.io/${GITHUB_USER}/quelyos/backend:${TAG}|g" k8s/base/odoo/deployment.yaml
        sed -i.bak "s|image: quelyos/vitrine-quelyos:.*|image: ghcr.io/${GITHUB_USER}/quelyos/vitrine-quelyos:${TAG}|g" k8s/base/vitrine-quelyos/deployment.yaml
        sed -i.bak "s|image: quelyos/vitrine-client:.*|image: ghcr.io/${GITHUB_USER}/quelyos/vitrine-client:${TAG}|g" k8s/base/vitrine-client/deployment.yaml
        sed -i.bak "s|image: quelyos/dashboard-client:.*|image: ghcr.io/${GITHUB_USER}/quelyos/dashboard-client:${TAG}|g" k8s/base/dashboard-client/deployment.yaml
    fi
fi
echo ""

# Générer secrets si pas existants
echo -e "${YELLOW}🔐 Configuration secrets...${NC}"
if ! kubectl get secret quelyos-secrets -n quelyos &>/dev/null; then
    echo "Génération nouveaux secrets..."
    POSTGRES_PWD=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 32)
    SESSION_SECRET=$(openssl rand -base64 32)

    kubectl create namespace quelyos --dry-run=client -o yaml | kubectl apply -f -
    kubectl create secret generic quelyos-secrets \
      --from-literal=POSTGRES_PASSWORD="${POSTGRES_PWD}" \
      --from-literal=JWT_SECRET="${JWT_SECRET}" \
      --from-literal=SESSION_SECRET="${SESSION_SECRET}" \
      --from-literal=SENTRY_DSN="" \
      -n quelyos

    echo ""
    echo -e "${GREEN}✅ Secrets créés${NC}"
    echo "IMPORTANT: Sauvegarder ces valeurs !"
    echo "POSTGRES_PASSWORD=${POSTGRES_PWD}"
    echo "JWT_SECRET=${JWT_SECRET}"
    echo "SESSION_SECRET=${SESSION_SECRET}"
    echo ""
else
    echo -e "${GREEN}✅ Secrets déjà configurés${NC}"
fi
echo ""

# Mise à jour domaines dans Ingress
echo -e "${YELLOW}📝 Configuration domaines...${NC}"
cp k8s/base/ingress.yaml k8s/base/ingress.yaml.backup
sed -i.bak "s/quelyos\.com/${DOMAIN}/g" k8s/base/ingress.yaml

# Déployer sur K8s
echo -e "${YELLOW}🚀 Déploiement sur Kubernetes...${NC}"
kubectl apply -k k8s/overlays/contabo

# Restaurer ingress original
mv k8s/base/ingress.yaml.backup k8s/base/ingress.yaml 2>/dev/null || true

echo ""
echo -e "${YELLOW}⏳ Attente démarrage services...${NC}"

# Attendre PostgreSQL
kubectl wait --for=condition=ready pod -l app=postgres -n quelyos --timeout=180s 2>/dev/null &
PG_PID=$!

# Attendre Redis
kubectl wait --for=condition=ready pod -l app=redis -n quelyos --timeout=60s 2>/dev/null &
REDIS_PID=$!

# Attendre tous les waits
wait $PG_PID && echo "  ✅ PostgreSQL ready"
wait $REDIS_PID && echo "  ✅ Redis ready"

# Attendre Backend
kubectl wait --for=condition=ready pod -l app=backend -n quelyos --timeout=300s 2>/dev/null && echo "  ✅ Backend ready" &
BACKEND_PID=$!

# Attendre Frontends
kubectl wait --for=condition=ready pod -l app=vitrine-quelyos -n quelyos --timeout=120s 2>/dev/null && echo "  ✅ Vitrine Quelyos ready" &
kubectl wait --for=condition=ready pod -l app=vitrine-client -n quelyos --timeout=120s 2>/dev/null && echo "  ✅ Vitrine Client ready" &
kubectl wait --for=condition=ready pod -l app=dashboard-client -n quelyos --timeout=120s 2>/dev/null && echo "  ✅ Dashboard ready" &

wait $BACKEND_PID

echo ""
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo ""

# Statut
echo -e "${YELLOW}📊 Statut des services:${NC}"
kubectl get pods -n quelyos -o wide

echo ""
echo -e "${YELLOW}🌐 Services exposés:${NC}"
kubectl get svc -n quelyos

echo ""
echo -e "${YELLOW}🔗 Ingress:${NC}"
kubectl get ingress -n quelyos

echo ""
echo -e "${YELLOW}🔒 Certificats TLS:${NC}"
kubectl get certificates -n quelyos 2>/dev/null || echo "  (en cours de génération...)"

echo ""
echo -e "${GREEN}🎉 Quelyos Suite déployée sur Contabo !${NC}"
echo ""
echo "Accès:"
echo "  - Site Vitrine:    https://${DOMAIN}"
echo "  - E-commerce:      https://shop.${DOMAIN}"
echo "  - Dashboard:       https://dashboard.${DOMAIN}"
echo "  - API:             https://api.${DOMAIN}"
echo ""
echo "Commandes utiles:"
echo "  export KUBECONFIG=/tmp/k3s-config.yaml"
echo "  kubectl get pods -n quelyos"
echo "  kubectl logs -n quelyos -l app=backend -f"
echo "  kubectl describe certificate quelyos-tls -n quelyos"
echo ""
echo "Kubeconfig temporaire: /tmp/k3s-config.yaml"
