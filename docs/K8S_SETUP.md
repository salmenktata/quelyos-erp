# Guide Déploiement Kubernetes - Quelyos Suite

Guide complet pour déployer Quelyos Suite sur Kubernetes.

## 🎯 Prérequis

### Outils Locaux

```bash
# kubectl
brew install kubectl

# kustomize
brew install kustomize

# Docker (pour builds locaux)
brew install --cask docker

# helm (optionnel)
brew install helm
```

### Cluster Kubernetes

**Options** :
- **Cloud** : AWS EKS, GCP GKE, Azure AKS
- **Local** : Minikube, Kind, Docker Desktop
- **On-Premise** : K3s, RKE2, Kubeadm

**Ressources minimales recommandées** :
- **Dev** : 2 nodes (4 vCPU, 8GB RAM chacun)
- **Staging** : 3 nodes (4 vCPU, 16GB RAM chacun)
- **Production** : 5+ nodes (8 vCPU, 32GB RAM chacun)

## 📦 Étape 1 : Build Images Docker

### Option A : Build Local + Push Registry

```bash
# Configurer registry (Docker Hub, GHCR, ECR, GCR, ACR)
export DOCKER_REGISTRY="ghcr.io/votre-org/quelyos"
export DOCKER_TAG="v1.0.0"

# Build toutes les images
./scripts/docker-build-local.sh

# Login registry
docker login ghcr.io -u USERNAME -p GITHUB_TOKEN

# Push images
docker push ${DOCKER_REGISTRY}/backend:${DOCKER_TAG}
docker push ${DOCKER_REGISTRY}/vitrine-quelyos:${DOCKER_TAG}
docker push ${DOCKER_REGISTRY}/vitrine-client:${DOCKER_TAG}
docker push ${DOCKER_REGISTRY}/dashboard-client:${DOCKER_TAG}
```

### Option B : CI/CD Automatique (Recommandé)

Le workflow `.github/workflows/docker-build-push.yml` build et push automatiquement sur push vers `main`.

**Configuration GitHub** :
1. Activer GitHub Container Registry (GHCR)
2. Le workflow utilise `GITHUB_TOKEN` (automatique)
3. Images disponibles : `ghcr.io/OWNER/quelyos/*:latest`

## 🔐 Étape 2 : Configurer Secrets

### Secrets Kubernetes

```bash
# Générer secrets sécurisés
POSTGRES_PWD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Créer namespace
kubectl create namespace quelyos

# Créer secrets
kubectl create secret generic quelyos-secrets \
  --from-literal=POSTGRES_PASSWORD="${POSTGRES_PWD}" \
  --from-literal=JWT_SECRET="${JWT_SECRET}" \
  --from-literal=SESSION_SECRET="${SESSION_SECRET}" \
  --from-literal=SENTRY_DSN="" \
  -n quelyos
```

### External Secrets Operator (Production)

```bash
# Installer External Secrets Operator
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets -n external-secrets-system --create-namespace

# Créer SecretStore (exemple AWS)
kubectl apply -f - <<EOF
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
  namespace: quelyos
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
EOF

# Créer ExternalSecret
kubectl apply -f - <<EOF
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: quelyos-secrets
  namespace: quelyos
spec:
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: quelyos-secrets
  data:
  - secretKey: POSTGRES_PASSWORD
    remoteRef:
      key: quelyos/postgres-password
  - secretKey: JWT_SECRET
    remoteRef:
      key: quelyos/jwt-secret
EOF
```

## 🌐 Étape 3 : Installer Nginx Ingress

```bash
# Installer Nginx Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml

# Attendre déploiement
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Obtenir LoadBalancer IP
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Exemple output:
# NAME                       TYPE           EXTERNAL-IP
# ingress-nginx-controller   LoadBalancer   34.123.45.67
```

## 🔒 Étape 4 : Configurer TLS/SSL

### Option A : cert-manager (Let's Encrypt)

```bash
# Installer cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Attendre déploiement
kubectl wait --namespace cert-manager \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/instance=cert-manager \
  --timeout=120s

# Créer ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@quelyos.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Option B : Certificat manuel

```bash
# Créer TLS secret depuis certificats existants
kubectl create secret tls quelyos-tls \
  --cert=path/to/cert.crt \
  --key=path/to/cert.key \
  -n quelyos
```

## 📊 Étape 5 : Configurer Storage

### AWS EBS (EKS)

```bash
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  fsType: ext4
  iops: "3000"
  throughput: "125"
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
EOF

# Mettre à jour PVCs pour utiliser gp3
sed -i 's/storageClassName: standard/storageClassName: gp3/g' k8s/base/storage/*.yaml
```

### GCP Persistent Disk (GKE)

```bash
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: premium-rwo
provisioner: pd.csi.storage.gke.io
parameters:
  type: pd-ssd
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
EOF

sed -i 's/storageClassName: standard/storageClassName: premium-rwo/g' k8s/base/storage/*.yaml
```

### Azure Disk (AKS)

```bash
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: managed-premium
provisioner: disk.csi.azure.com
parameters:
  skuName: Premium_LRS
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
EOF

sed -i 's/storageClassName: standard/storageClassName: managed-premium/g' k8s/base/storage/*.yaml
```

## 🚀 Étape 6 : Déployer Application

### Development

```bash
./scripts/k8s-deploy.sh development
```

### Staging

```bash
./scripts/k8s-deploy.sh staging
```

### Production

```bash
# Vérifier images
kubectl get deployments -n quelyos -o jsonpath='{.items[*].spec.template.spec.containers[*].image}'

# Déployer
./scripts/k8s-deploy.sh production

# Vérifier rollout
kubectl rollout status deployment/backend -n quelyos
kubectl rollout status deployment/vitrine-quelyos -n quelyos
kubectl rollout status deployment/vitrine-client -n quelyos
kubectl rollout status deployment/dashboard-client -n quelyos
```

## 🌍 Étape 7 : Configurer DNS

Pointer vos domaines vers l'IP du LoadBalancer Nginx Ingress :

```bash
# Obtenir IP externe
INGRESS_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Ingress IP: $INGRESS_IP"
```

**Records DNS à créer** :

| Type | Nom | Valeur |
|------|-----|--------|
| A | quelyos.com | `<INGRESS_IP>` |
| A | www.quelyos.com | `<INGRESS_IP>` |
| A | shop.quelyos.com | `<INGRESS_IP>` |
| A | dashboard.quelyos.com | `<INGRESS_IP>` |
| A | api.quelyos.com | `<INGRESS_IP>` |

**Vérifier propagation** :
```bash
dig quelyos.com +short
nslookup shop.quelyos.com
```

## ✅ Étape 8 : Vérification Post-Déploiement

```bash
# Pods
kubectl get pods -n quelyos -o wide

# Services
kubectl get svc -n quelyos

# Ingress
kubectl get ingress -n quelyos

# Logs
kubectl logs -n quelyos -l app=backend --tail=50

# Health checks
kubectl run curl-test --image=curlimages/curl:latest --rm -it --restart=Never -- \
  curl -f http://backend-service.quelyos.svc.cluster.local:8069/web/health

# Depuis l'extérieur (après DNS)
curl https://quelyos.com
curl https://shop.quelyos.com
curl https://api.quelyos.com/web/health
```

## 📈 Étape 9 : Monitoring (Optionnel)

### Prometheus + Grafana

```bash
# Ajouter repo Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Installer stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace

# Port-forward Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Login: admin / prom-operator
```

### Loki (Logs centralisés)

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm install loki grafana/loki-stack --namespace monitoring
```

## 🔄 Étape 10 : CI/CD GitHub Actions

### Configuration Secrets GitHub

Dans **Settings → Secrets → Actions**, ajouter :

**Kubernetes** :
- `KUBECONFIG` : Base64 du fichier kubeconfig (`cat ~/.kube/config | base64`)
- `K8S_PROVIDER` : `eks`, `gke`, `aks`, ou vide

**AWS (si EKS)** :
- `AWS_ROLE_ARN`
- `AWS_REGION`
- `EKS_CLUSTER_NAME`

**GCP (si GKE)** :
- `GCP_SA_KEY`
- `GKE_CLUSTER_NAME`
- `GKE_LOCATION`

**Azure (si AKS)** :
- `AZURE_CREDENTIALS`
- `AKS_RESOURCE_GROUP`
- `AKS_CLUSTER_NAME`

**Application** :
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `SESSION_SECRET`
- `SENTRY_DSN` (optionnel)

### Workflows Disponibles

1. **Build & Push** (`.github/workflows/docker-build-push.yml`)
   - Trigger : Push sur `main`, tags `v*`
   - Build 4 images Docker
   - Push vers GHCR
   - Update image tags dans K8s manifests

2. **Deploy** (`.github/workflows/k8s-deploy.yml`)
   - Trigger : Après build réussi, ou manuel
   - Deploy vers staging/production
   - Smoke tests

3. **Rollback** (`.github/workflows/k8s-rollback.yml`)
   - Trigger : Manuel uniquement
   - Rollback vers version précédente

### Déclencher Déploiement

```bash
# Automatique : Push sur main
git push origin main

# Manuel : Via GitHub UI
# Actions → Deploy to Kubernetes → Run workflow → Choisir environnement

# Via gh CLI
gh workflow run k8s-deploy.yml -f environment=production
```

## 🛠️ Commandes Utiles

### Scaling Manuel

```bash
# Scale un deployment
kubectl scale deployment/vitrine-client -n quelyos --replicas=5

# Désactiver HPA temporairement
kubectl delete hpa vitrine-client-hpa -n quelyos
```

### Updates

```bash
# Update image
kubectl set image deployment/vitrine-client \
  vitrine-client=ghcr.io/org/quelyos/vitrine-client:v2.0 \
  -n quelyos

# Rollback
kubectl rollout undo deployment/vitrine-client -n quelyos

# Historique
kubectl rollout history deployment/vitrine-client -n quelyos
```

### Debug

```bash
# Shell dans un pod
kubectl exec -it <pod-name> -n quelyos -- sh

# Logs en temps réel
kubectl logs -n quelyos -l app=backend -f --tail=100

# Describe pod (voir events)
kubectl describe pod <pod-name> -n quelyos

# Port-forward (tester localement)
kubectl port-forward -n quelyos svc/backend-service 8069:8069
```

### Backup PostgreSQL

```bash
# Backup
kubectl exec -n quelyos postgres-0 -- \
  pg_dump -U quelyos quelyos | gzip > backup-$(date +%Y%m%d).sql.gz

# Restore
gunzip < backup-20260129.sql.gz | \
  kubectl exec -i -n quelyos postgres-0 -- \
  psql -U quelyos quelyos
```

## 🚨 Troubleshooting

### Pods CrashLoopBackOff

```bash
kubectl describe pod <pod-name> -n quelyos
kubectl logs <pod-name> -n quelyos --previous
```

**Causes fréquentes** :
- Image inexistante ou mauvais tag
- Secrets manquants
- Healthcheck trop strict
- Dépendances (DB) pas ready

### Services inaccessibles

```bash
# Vérifier endpoints
kubectl get endpoints -n quelyos

# Tester connectivité interne
kubectl run debug --image=busybox -it --rm -- sh
# Dans le pod : wget -O- http://backend-service:8069/web/health
```

### Ingress 404

```bash
# Vérifier ingress
kubectl describe ingress quelyos-ingress -n quelyos

# Logs Nginx Ingress
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
```

### PVC Pending

```bash
kubectl describe pvc postgres-pvc -n quelyos
```

**Causes** :
- StorageClass inexistante
- Quota dépassé
- Zone AZ incompatible (AWS)

## 📚 Ressources

- [Kubernetes Docs](https://kubernetes.io/docs/)
- [Kustomize](https://kustomize.io/)
- [Nginx Ingress](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager](https://cert-manager.io/)
- [External Secrets](https://external-secrets.io/)
