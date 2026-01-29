#!/bin/bash
# Afficher logs d'un service sur Contabo

set -e

VPS_HOST="quelyos-vps"
VPS_IP="184.174.32.177"

SERVICE=${1:-"backend"}

# Récupérer kubeconfig
ssh ${VPS_HOST} "sudo cat /etc/rancher/k3s/k3s.yaml" > /tmp/k3s-config.yaml
sed -i.bak "s/127.0.0.1/${VPS_IP}/g" /tmp/k3s-config.yaml
export KUBECONFIG=/tmp/k3s-config.yaml

echo "📜 Logs ${SERVICE} (suivre avec -f)..."
echo ""

kubectl logs -n quelyos -l app=${SERVICE} --tail=100 -f
