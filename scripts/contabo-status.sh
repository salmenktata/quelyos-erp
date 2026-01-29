#!/bin/bash
# Vérifier status déploiement Contabo

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

VPS_HOST="quelyos-vps"
VPS_IP="184.174.32.177"

echo -e "${GREEN}=== Status Quelyos Suite - Contabo VPS ===${NC}"
echo ""

# Vérifier connexion SSH
if ! ssh -o ConnectTimeout=5 ${VPS_HOST} "echo 'OK'" &>/dev/null; then
    echo -e "${RED}❌ Impossible de se connecter au VPS${NC}"
    exit 1
fi

# Récupérer kubeconfig
ssh ${VPS_HOST} "sudo cat /etc/rancher/k3s/k3s.yaml" > /tmp/k3s-config.yaml
sed -i.bak "s/127.0.0.1/${VPS_IP}/g" /tmp/k3s-config.yaml
export KUBECONFIG=/tmp/k3s-config.yaml

# Vérifier cluster
echo -e "${YELLOW}📊 Cluster K3s:${NC}"
kubectl get nodes -o wide

echo ""
echo -e "${YELLOW}🐳 Pods Quelyos:${NC}"
kubectl get pods -n quelyos -o wide

echo ""
echo -e "${YELLOW}💾 Storage:${NC}"
kubectl get pvc -n quelyos

echo ""
echo -e "${YELLOW}🌐 Services:${NC}"
kubectl get svc -n quelyos

echo ""
echo -e "${YELLOW}🔗 Ingress:${NC}"
kubectl get ingress -n quelyos

echo ""
echo -e "${YELLOW}🔒 Certificats TLS:${NC}"
kubectl get certificates -n quelyos

echo ""
echo -e "${YELLOW}📈 Utilisation Ressources:${NC}"
kubectl top nodes 2>/dev/null || echo "  (metrics-server non installé)"
kubectl top pods -n quelyos 2>/dev/null || echo "  (metrics-server non installé)"

echo ""
echo -e "${YELLOW}🔍 Events récents:${NC}"
kubectl get events -n quelyos --sort-by='.lastTimestamp' | tail -10

echo ""
echo "Kubeconfig: /tmp/k3s-config.yaml"
