#!/bin/bash
# Script de déploiement Kubernetes Quelyos Suite

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ENVIRONMENT=${1:-development}

echo -e "${GREEN}=== Déploiement Kubernetes Quelyos Suite ===${NC}"
echo -e "Environnement: ${YELLOW}${ENVIRONMENT}${NC}"
echo ""

# Vérifier kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl non installé${NC}"
    exit 1
fi

# Vérifier kustomize
if ! command -v kustomize &> /dev/null; then
    echo -e "${YELLOW}⚠️  kustomize non installé, utilisation de kubectl apply -k${NC}"
fi

# Vérifier connexion cluster
echo -e "${YELLOW}🔍 Vérification connexion cluster...${NC}"
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Pas de connexion au cluster Kubernetes${NC}"
    exit 1
fi

CONTEXT=$(kubectl config current-context)
echo -e "${GREEN}✅ Connecté à: ${CONTEXT}${NC}"
echo ""

# Confirmation pour production
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${RED}⚠️  ATTENTION: Déploiement en PRODUCTION${NC}"
    read -p "Êtes-vous sûr ? (oui/non): " CONFIRM
    if [ "$CONFIRM" != "oui" ]; then
        echo "Déploiement annulé"
        exit 0
    fi
fi

# Déployer
echo -e "${YELLOW}📦 Déploiement des manifests...${NC}"
kubectl apply -k "k8s/overlays/${ENVIRONMENT}"

echo ""
echo -e "${YELLOW}⏳ Attente démarrage des pods...${NC}"

# Namespace selon environnement
NAMESPACE="quelyos"
if [ "$ENVIRONMENT" = "development" ]; then
    NAMESPACE="quelyos-dev"
elif [ "$ENVIRONMENT" = "staging" ]; then
    NAMESPACE="quelyos-staging"
fi

# Attendre PostgreSQL
echo "  - PostgreSQL..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=180s

# Attendre Redis
echo "  - Redis..."
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=60s

# Attendre Backend
echo "  - Backend API..."
kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=300s

# Attendre frontends
echo "  - Vitrine Quelyos..."
kubectl wait --for=condition=ready pod -l app=vitrine-quelyos -n $NAMESPACE --timeout=120s || true

echo "  - Vitrine Client..."
kubectl wait --for=condition=ready pod -l app=vitrine-client -n $NAMESPACE --timeout=120s || true

echo "  - Dashboard Client..."
kubectl wait --for=condition=ready pod -l app=dashboard-client -n $NAMESPACE --timeout=120s || true

echo ""
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo ""

# Afficher statut
echo -e "${YELLOW}📊 Statut des services:${NC}"
kubectl get pods -n $NAMESPACE -o wide

echo ""
echo -e "${YELLOW}🌐 Services exposés:${NC}"
kubectl get svc -n $NAMESPACE

echo ""
echo -e "${YELLOW}🔗 Ingress:${NC}"
kubectl get ingress -n $NAMESPACE

echo ""
echo -e "${GREEN}🎉 Déploiement réussi !${NC}"
echo ""
echo "Commandes utiles:"
echo "  kubectl get pods -n $NAMESPACE"
echo "  kubectl logs -n $NAMESPACE -l app=backend -f"
echo "  kubectl describe pod <pod-name> -n $NAMESPACE"
echo "  kubectl port-forward -n $NAMESPACE svc/vitrine-quelyos-service 3000:3000"
