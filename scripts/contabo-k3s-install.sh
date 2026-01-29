#!/bin/bash
# Installation K3s + Stack Quelyos sur VPS Contabo

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Installation K3s sur Contabo VPS ===${NC}"
echo ""

# Vérifier root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Ce script doit être exécuté en root${NC}"
  exit 1
fi

# Obtenir IP publique
PUBLIC_IP=$(curl -s ifconfig.me)
echo -e "IP Publique détectée: ${YELLOW}${PUBLIC_IP}${NC}"
echo ""

# Configuration
read -p "Domaine principal (ex: quelyos.com): " DOMAIN
read -p "Email pour Let's Encrypt: " EMAIL

echo ""
echo -e "${YELLOW}📦 Installation des prérequis...${NC}"

# Update système
apt-get update
apt-get install -y curl wget git jq

# Installer K3s (sans Traefik, on utilisera Nginx Ingress)
echo -e "${YELLOW}🚀 Installation K3s...${NC}"
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable=traefik --write-kubeconfig-mode=644" sh -

# Attendre K3s
sleep 10
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# Vérifier K3s
kubectl get nodes

echo ""
echo -e "${YELLOW}📦 Installation MetalLB (LoadBalancer)...${NC}"

# Installer MetalLB
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.12/config/manifests/metallb-native.yaml

# Attendre MetalLB
kubectl wait --namespace metallb-system \
  --for=condition=ready pod \
  --selector=app=metallb \
  --timeout=90s

# Configurer MetalLB avec l'IP publique
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: metallb-system
  name: config
data:
  config: |
    address-pools:
    - name: default
      protocol: layer2
      addresses:
      - ${PUBLIC_IP}/32
EOF

echo ""
echo -e "${YELLOW}📦 Installation Nginx Ingress...${NC}"

# Installer Nginx Ingress (version bare-metal)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/baremetal/deploy.yaml

# Patcher pour utiliser LoadBalancer (MetalLB)
kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{"spec": {"type": "LoadBalancer"}}'

# Attendre Nginx Ingress
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

echo ""
echo -e "${YELLOW}📦 Installation cert-manager (TLS)...${NC}"

# Installer cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Attendre cert-manager
kubectl wait --namespace cert-manager \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/instance=cert-manager \
  --timeout=120s

# Créer ClusterIssuer Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ${EMAIL}
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

echo ""
echo -e "${YELLOW}📦 Configuration Storage Local...${NC}"

# K3s inclut déjà local-path-provisioner
kubectl get storageclass

# Définir local-path comme default
kubectl patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'

echo ""
echo -e "${GREEN}✅ Installation K3s terminée !${NC}"
echo ""
echo "Prochaines étapes:"
echo ""
echo "1. Configurer DNS (pointer vers ${PUBLIC_IP}):"
echo "   ${DOMAIN}           A    ${PUBLIC_IP}"
echo "   www.${DOMAIN}       A    ${PUBLIC_IP}"
echo "   shop.${DOMAIN}      A    ${PUBLIC_IP}"
echo "   dashboard.${DOMAIN} A    ${PUBLIC_IP}"
echo "   api.${DOMAIN}       A    ${PUBLIC_IP}"
echo ""
echo "2. Copier kubeconfig vers machine locale:"
echo "   scp root@${PUBLIC_IP}:/etc/rancher/k3s/k3s.yaml ~/.kube/config-contabo"
echo "   sed -i 's/127.0.0.1/${PUBLIC_IP}/g' ~/.kube/config-contabo"
echo "   export KUBECONFIG=~/.kube/config-contabo"
echo ""
echo "3. Déployer Quelyos Suite:"
echo "   ./scripts/contabo-deploy.sh ${DOMAIN}"
echo ""
echo "Kubeconfig: /etc/rancher/k3s/k3s.yaml"
