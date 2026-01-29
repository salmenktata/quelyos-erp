#!/bin/bash
# Déploiement Quelyos Suite sur Contabo VPS

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DOMAIN=${1:-"quelyos.com"}
ENVIRONMENT=${2:-"production"}

echo -e "${GREEN}=== Déploiement Quelyos Suite - Contabo VPS ===${NC}"
echo -e "Domaine: ${YELLOW}${DOMAIN}${NC}"
echo -e "Environnement: ${YELLOW}${ENVIRONMENT}${NC}"
echo ""

# Vérifier kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl non installé${NC}"
    exit 1
fi

# Vérifier connexion cluster
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Pas de connexion au cluster K3s${NC}"
    echo "Configurer kubeconfig:"
    echo "  export KUBECONFIG=/etc/rancher/k3s/k3s.yaml"
    exit 1
fi

echo -e "${YELLOW}🔐 Génération des secrets...${NC}"

# Générer secrets sécurisés
POSTGRES_PWD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

echo "Secrets générés (sauvegarder dans un endroit sûr !)"
echo ""

# Créer namespace
kubectl create namespace quelyos --dry-run=client -o yaml | kubectl apply -f -

# Créer secrets
kubectl create secret generic quelyos-secrets \
  --from-literal=POSTGRES_PASSWORD="${POSTGRES_PWD}" \
  --from-literal=JWT_SECRET="${JWT_SECRET}" \
  --from-literal=SESSION_SECRET="${SESSION_SECRET}" \
  --from-literal=SENTRY_DSN="" \
  --namespace=quelyos \
  --dry-run=client -o yaml | kubectl apply -f -

echo -e "${YELLOW}📝 Mise à jour des domaines dans Ingress...${NC}"

# Backup ingress original
cp k8s/base/ingress.yaml k8s/base/ingress.yaml.backup

# Remplacer quelyos.com par le vrai domaine
sed -i.bak "s/quelyos\.com/${DOMAIN}/g" k8s/base/ingress.yaml

echo -e "${YELLOW}🚀 Déploiement des manifests...${NC}"

# Utiliser overlay production pour Contabo (resources optimisées)
kubectl apply -k k8s/overlays/${ENVIRONMENT}

echo ""
echo -e "${YELLOW}⏳ Attente démarrage des services...${NC}"

# Attendre PostgreSQL
echo "  - PostgreSQL..."
kubectl wait --for=condition=ready pod -l app=postgres -n quelyos --timeout=180s

# Attendre Redis
echo "  - Redis..."
kubectl wait --for=condition=ready pod -l app=redis -n quelyos --timeout=60s

# Attendre Backend
echo "  - Backend API..."
kubectl wait --for=condition=ready pod -l app=backend -n quelyos --timeout=300s

# Attendre Frontends
echo "  - Vitrine Quelyos..."
kubectl wait --for=condition=ready pod -l app=vitrine-quelyos -n quelyos --timeout=120s || true

echo "  - Vitrine Client..."
kubectl wait --for=condition=ready pod -l app=vitrine-client -n quelyos --timeout=120s || true

echo "  - Dashboard Client..."
kubectl wait --for=condition=ready pod -l app=dashboard-client -n quelyos --timeout=120s || true

echo ""
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo ""

# Afficher statut
echo -e "${YELLOW}📊 Statut des services:${NC}"
kubectl get pods -n quelyos -o wide

echo ""
echo -e "${YELLOW}🌐 LoadBalancer IP:${NC}"
kubectl get svc -n ingress-nginx ingress-nginx-controller

echo ""
echo -e "${YELLOW}🔗 Ingress:${NC}"
kubectl get ingress -n quelyos

echo ""
echo -e "${GREEN}🎉 Quelyos Suite déployée !${NC}"
echo ""
echo "Accès:"
echo "  - Site Vitrine:    https://${DOMAIN}"
echo "  - E-commerce:      https://shop.${DOMAIN}"
echo "  - Dashboard:       https://dashboard.${DOMAIN}"
echo "  - API:             https://api.${DOMAIN}"
echo ""
echo "Secrets sauvegardés dans le cluster (namespace: quelyos)"
echo ""
echo "Commandes utiles:"
echo "  kubectl get pods -n quelyos"
echo "  kubectl logs -n quelyos -l app=backend -f"
echo "  kubectl get certificates -n quelyos  # Vérifier TLS"

# Restaurer ingress original
mv k8s/base/ingress.yaml.backup k8s/base/ingress.yaml 2>/dev/null || true
