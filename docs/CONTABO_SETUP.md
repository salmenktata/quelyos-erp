# Guide Déploiement Contabo VPS - Quelyos Suite

Guide complet pour déployer Quelyos Suite sur un VPS Contabo avec K3s.

## 🎯 Prérequis

### VPS Contabo Recommandé

**Pour Production** :
- **VPS 400 M** : 16 vCPU, 64GB RAM, 1.6TB NVMe (~€30/mois)
- **VPS 300 M** : 12 vCPU, 48GB RAM, 1.2TB NVMe (~€23/mois)

**Pour Staging/Dev** :
- **VPS 200 M** : 8 vCPU, 32GB RAM, 800GB NVMe (~€15/mois)

### Système d'exploitation

Ubuntu 22.04 LTS (recommandé)

### Domaine

Domaine configuré avec accès aux DNS (ex: OVH, Cloudflare, Namecheap)

## 🚀 Installation Rapide (2 commandes)

### 1. Sur le VPS Contabo (en root)

```bash
# SSH vers VPS
ssh root@VOTRE_IP_VPS

# Télécharger et exécuter le script d'installation
curl -fsSL https://raw.githubusercontent.com/VOTRE_ORG/QuelyosSuite/main/scripts/contabo-k3s-install.sh | bash
```

**Le script installe** :
- ✅ K3s (Kubernetes léger)
- ✅ MetalLB (LoadBalancer)
- ✅ Nginx Ingress Controller
- ✅ cert-manager (TLS Let's Encrypt)
- ✅ local-path Storage

**Durée** : ~5 minutes

### 2. Configuration DNS

Pointer vos domaines vers l'IP publique du VPS :

```
Type  Nom                  Valeur
────────────────────────────────────────
A     quelyos.com          <IP_VPS>
A     www.quelyos.com      <IP_VPS>
A     shop.quelyos.com     <IP_VPS>
A     dashboard.quelyos.com <IP_VPS>
A     api.quelyos.com      <IP_VPS>
```

**Vérifier propagation** :
```bash
dig quelyos.com +short
# Doit retourner: <IP_VPS>
```

### 3. Déployer Quelyos Suite

**Depuis votre machine locale** :

```bash
# Récupérer kubeconfig
scp root@<IP_VPS>:/etc/rancher/k3s/k3s.yaml ~/.kube/config-contabo
sed -i 's/127.0.0.1/<IP_VPS>/g' ~/.kube/config-contabo
export KUBECONFIG=~/.kube/config-contabo

# Vérifier connexion
kubectl get nodes

# Déployer
./scripts/contabo-deploy.sh quelyos.com
```

**Durée** : ~10 minutes (téléchargement images + démarrage services)

## 📋 Installation Manuelle (étape par étape)

### Étape 1 : Connexion VPS

```bash
ssh root@<IP_VPS>
```

### Étape 2 : Update système

```bash
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git jq ufw
```

### Étape 3 : Firewall (UFW)

```bash
# Autoriser SSH (IMPORTANT !)
ufw allow 22/tcp

# Autoriser HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Autoriser K3s API (pour kubectl distant)
ufw allow 6443/tcp

# Activer firewall
ufw --force enable
ufw status
```

### Étape 4 : Installer K3s

```bash
# Installer K3s (sans Traefik)
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable=traefik --write-kubeconfig-mode=644" sh -

# Vérifier
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl get nodes
```

### Étape 5 : Installer MetalLB

```bash
# Installer MetalLB
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.12/config/manifests/metallb-native.yaml

# Attendre pods ready
kubectl wait --namespace metallb-system \
  --for=condition=ready pod \
  --selector=app=metallb \
  --timeout=90s

# Configurer avec IP publique
PUBLIC_IP=$(curl -s ifconfig.me)

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
```

### Étape 6 : Installer Nginx Ingress

```bash
# Installer Nginx Ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/baremetal/deploy.yaml

# Patcher pour LoadBalancer
kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{"spec": {"type": "LoadBalancer"}}'

# Attendre ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Vérifier IP externe
kubectl get svc -n ingress-nginx ingress-nginx-controller
# EXTERNAL-IP doit être <IP_VPS>
```

### Étape 7 : Installer cert-manager

```bash
# Installer cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Attendre ready
kubectl wait --namespace cert-manager \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/instance=cert-manager \
  --timeout=120s

# Créer ClusterIssuer (remplacer EMAIL)
cat <<EOF | kubectl apply -f -
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

### Étape 8 : Build Images Docker

**Sur votre machine locale** :

```bash
# Build images
./scripts/docker-build-local.sh

# Push vers registry (GHCR ou Docker Hub)
docker login ghcr.io
docker tag quelyos/backend:latest ghcr.io/VOTRE_ORG/quelyos/backend:latest
docker push ghcr.io/VOTRE_ORG/quelyos/backend:latest

# Répéter pour toutes les images
docker push ghcr.io/VOTRE_ORG/quelyos/vitrine-quelyos:latest
docker push ghcr.io/VOTRE_ORG/quelyos/vitrine-client:latest
docker push ghcr.io/VOTRE_ORG/quelyos/dashboard-client:latest
```

### Étape 9 : Mettre à jour manifests K8s

Éditer `k8s/base/*/deployment.yaml` et remplacer :
```yaml
image: quelyos/backend:latest
# Par:
image: ghcr.io/VOTRE_ORG/quelyos/backend:latest
```

### Étape 10 : Déployer Quelyos Suite

```bash
# Générer secrets
POSTGRES_PWD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Créer namespace + secrets
kubectl create namespace quelyos
kubectl create secret generic quelyos-secrets \
  --from-literal=POSTGRES_PASSWORD="${POSTGRES_PWD}" \
  --from-literal=JWT_SECRET="${JWT_SECRET}" \
  --from-literal=SESSION_SECRET="${SESSION_SECRET}" \
  -n quelyos

# Déployer avec overlay Contabo
kubectl apply -k k8s/overlays/contabo

# Monitorer déploiement
kubectl get pods -n quelyos -w
```

## 🔍 Vérification Post-Déploiement

### Vérifier Pods

```bash
kubectl get pods -n quelyos

# Output attendu (tous Running):
# NAME                               READY   STATUS
# backend-xxx                        1/1     Running
# postgres-0                         1/1     Running
# redis-0                            1/1     Running
# vitrine-quelyos-xxx                1/1     Running
# vitrine-client-xxx                 1/1     Running
# dashboard-client-xxx               1/1     Running
```

### Vérifier Ingress

```bash
kubectl get ingress -n quelyos

# Output:
# NAME              HOSTS                    ADDRESS      PORTS
# quelyos-ingress   quelyos.com,shop...      <IP_VPS>     80, 443
```

### Vérifier Certificats TLS

```bash
kubectl get certificates -n quelyos

# Attendre Status: True (peut prendre 2-5 min)
kubectl describe certificate quelyos-tls -n quelyos
```

### Tester Endpoints

```bash
# Depuis le VPS
curl -k https://quelyos.com
curl -k https://api.quelyos.com/web/health

# Depuis votre machine
curl https://quelyos.com
curl https://shop.quelyos.com
curl https://dashboard.quelyos.com
```

## 📊 Ressources Utilisées (VPS 400 M)

**Allocation typique** :
```
Service              Pods  CPU/pod  Mem/pod  Total CPU  Total Mem
────────────────────────────────────────────────────────────────
PostgreSQL           1     1000m    2Gi      1000m      2Gi
Redis                1     250m     512Mi    250m       512Mi
Backend API          1     1000m    2Gi      1000m      2Gi
Vitrine Quelyos      2     250m     512Mi    500m       1Gi
Vitrine Client       2     250m     512Mi    500m       1Gi
Dashboard            1     100m     256Mi    100m       256Mi
────────────────────────────────────────────────────────────────
TOTAL                8     -        -        3.35 CPU   ~7Gi RAM
────────────────────────────────────────────────────────────────
Disponible (VPS 400) -     -        -        16 vCPU    64Gi RAM
Marge                -     -        -        12.65 CPU  57Gi RAM
```

**Conclusion** : Large marge pour croissance (HPA peut scaler jusqu'à ~15 pods)

## 🔄 Backup & Maintenance

### Backup PostgreSQL Automatique

```bash
# Créer CronJob backup quotidien
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: quelyos
spec:
  schedule: "0 2 * * *"  # Tous les jours à 2h AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:16-alpine
            command:
            - sh
            - -c
            - |
              pg_dump -h postgres-service -U quelyos quelyos | \
              gzip > /backup/quelyos-\$(date +%Y%m%d-%H%M%S).sql.gz
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: quelyos-secrets
                  key: POSTGRES_PASSWORD
            volumeMounts:
            - name: backup
              mountPath: /backup
          restartPolicy: OnFailure
          volumes:
          - name: backup
            hostPath:
              path: /root/backups
              type: DirectoryOrCreate
EOF
```

### Backup Manuel

```bash
# Backup DB
kubectl exec -n quelyos postgres-0 -- \
  pg_dump -U quelyos quelyos | gzip > backup-$(date +%Y%m%d).sql.gz

# Restore
gunzip < backup-20260129.sql.gz | \
  kubectl exec -i -n quelyos postgres-0 -- \
  psql -U quelyos quelyos
```

### Update Quelyos Suite

```bash
# Build nouvelles images
./scripts/docker-build-local.sh
docker push ghcr.io/VOTRE_ORG/quelyos/backend:v2.0
# ...

# Update K8s
kubectl set image deployment/backend \
  backend=ghcr.io/VOTRE_ORG/quelyos/backend:v2.0 \
  -n quelyos

# Rollback si problème
kubectl rollout undo deployment/backend -n quelyos
```

## 🚨 Troubleshooting

### Pods en CrashLoop

```bash
kubectl describe pod <pod-name> -n quelyos
kubectl logs <pod-name> -n quelyos --previous
```

### Certificat TLS non généré

```bash
# Vérifier ClusterIssuer
kubectl get clusterissuer letsencrypt-prod -o yaml

# Logs cert-manager
kubectl logs -n cert-manager -l app=cert-manager

# Forcer re-génération
kubectl delete certificate quelyos-tls -n quelyos
kubectl apply -k k8s/overlays/contabo
```

### LoadBalancer Pending

```bash
# Vérifier MetalLB
kubectl get pods -n metallb-system
kubectl logs -n metallb-system -l app=metallb

# Re-configurer IP
PUBLIC_IP=$(curl -s ifconfig.me)
kubectl edit configmap config -n metallb-system
# Mettre à jour avec ${PUBLIC_IP}/32
```

### Manque de mémoire

```bash
# Vérifier utilisation
kubectl top nodes
kubectl top pods -n quelyos

# Réduire réplicas temporairement
kubectl scale deployment/vitrine-client --replicas=1 -n quelyos
```

## 📈 Monitoring

### Installer Prometheus + Grafana

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace

# Port-forward Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Login: admin / prom-operator
```

### Métriques temps réel

```bash
kubectl top nodes
kubectl top pods -n quelyos
```

## 🔐 Sécurité

### Firewall (UFW)

```bash
ufw status verbose

# Bloquer tout sauf nécessaire
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 6443/tcp  # K3s API (optionnel si kubectl distant)
ufw enable
```

### Fail2Ban (protection SSH)

```bash
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### Updates automatiques

```bash
apt-get install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

## 💰 Coûts Mensuels (Contabo)

| VPS | vCPU | RAM | Stockage | Prix/mois |
|-----|------|-----|----------|-----------|
| VPS 200 M | 8 | 32GB | 800GB | ~€15 |
| VPS 300 M | 12 | 48GB | 1.2TB | ~€23 |
| VPS 400 M | 16 | 64GB | 1.6TB | ~€30 |

**Total infrastructure** : €30-50/mois (selon VPS choisi + domaine + backups)

**vs Cloud Managé** : AWS EKS = $72/mois (control plane) + EC2 instances (>$150/mois)

**Économie** : ~80% vs cloud managé 🎉
