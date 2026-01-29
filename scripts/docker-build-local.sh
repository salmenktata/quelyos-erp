#!/bin/bash
# Build Docker images localement

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

REGISTRY=${DOCKER_REGISTRY:-"quelyos"}
TAG=${DOCKER_TAG:-"latest"}

echo -e "${GREEN}=== Build Docker Images Localement ===${NC}"
echo -e "Registry: ${YELLOW}${REGISTRY}${NC}"
echo -e "Tag: ${YELLOW}${TAG}${NC}"
echo ""

# Backend
echo -e "${YELLOW}📦 Building backend...${NC}"
docker build -t ${REGISTRY}/backend:${TAG} \
  -f odoo-backend/Dockerfile \
  odoo-backend/

# Vitrine Quelyos
echo -e "${YELLOW}📦 Building vitrine-quelyos...${NC}"
docker build -t ${REGISTRY}/vitrine-quelyos:${TAG} \
  -f vitrine-quelyos/Dockerfile \
  .

# Vitrine Client
echo -e "${YELLOW}📦 Building vitrine-client...${NC}"
docker build -t ${REGISTRY}/vitrine-client:${TAG} \
  -f vitrine-client/Dockerfile \
  .

# Dashboard Client
echo -e "${YELLOW}📦 Building dashboard-client...${NC}"
docker build -t ${REGISTRY}/dashboard-client:${TAG} \
  -f dashboard-client/Dockerfile \
  .

echo ""
echo -e "${GREEN}✅ Toutes les images sont buildées !${NC}"
echo ""
echo "Images créées:"
echo "  - ${REGISTRY}/backend:${TAG}"
echo "  - ${REGISTRY}/vitrine-quelyos:${TAG}"
echo "  - ${REGISTRY}/vitrine-client:${TAG}"
echo "  - ${REGISTRY}/dashboard-client:${TAG}"
echo ""
echo "Pour pusher vers un registry:"
echo "  docker push ${REGISTRY}/backend:${TAG}"
echo "  docker push ${REGISTRY}/vitrine-quelyos:${TAG}"
echo "  docker push ${REGISTRY}/vitrine-client:${TAG}"
echo "  docker push ${REGISTRY}/dashboard-client:${TAG}"
