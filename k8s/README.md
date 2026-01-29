# Kubernetes Manifests - Quelyos Suite

Manifests Kubernetes avec Kustomize pour déploiements multi-environnements.

## 📁 Structure

```
k8s/
├── base/                       # Manifests de base (production-ready)
│   ├── namespace.yaml
│   ├── configmaps/
│   ├── secrets/
│   ├── storage/                # PVCs
│   ├── postgres/               # StatefulSet + Service
│   ├── redis/                  # StatefulSet + Service
│   ├── odoo/                   # Deployment + Service
│   ├── vitrine-quelyos/        # Deployment + Service + HPA
│   ├── vitrine-client/         # Deployment + Service + HPA
│   ├── dashboard-client/       # Deployment + Service + HPA
│   ├── ingress.yaml
│   └── kustomization.yaml
└── overlays/
    ├── development/            # Dev (1 replica, low resources)
    ├── staging/                # Staging (2 replicas, medium)
    └── production/             # Prod (3+ replicas, full resources)
```

## 🚀 Déploiement

### Prérequis

```bash
# Installer kubectl
brew install kubectl

# Installer kustomize
brew install kustomize

# Vérifier connexion cluster
kubectl cluster-info
kubectl get nodes
```

### Déployer un environnement

**Development:**
```bash
kubectl apply -k k8s/overlays/development
```

**Staging:**
```bash
kubectl apply -k k8s/overlays/staging
```

**Production:**
```bash
kubectl apply -k k8s/overlays/production
```

### Vérifier déploiement

```bash
# Statut des pods
kubectl get pods -n quelyos

# Logs d'un service
kubectl logs -n quelyos -l app=odoo --tail=100 -f

# Services exposés
kubectl get svc -n quelyos

# Ingress
kubectl get ingress -n quelyos
```

## 🔒 Secrets

**ATTENTION:** Ne jamais commit `secrets.yaml` avec vraies valeurs !

### Générer secrets production

```bash
# PostgreSQL password
echo -n "votre_password_fort" | base64

# JWT Secret
openssl rand -base64 32

# Éditer secrets
kubectl edit secret quelyos-secrets -n quelyos
```

### Utiliser External Secrets Operator (recommandé)

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: quelyos-secrets
  namespace: quelyos
spec:
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: quelyos-secrets
  data:
  - secretKey: POSTGRES_PASSWORD
    remoteRef:
      key: quelyos/postgres-password
```

## 📊 Auto-Scaling

### HPA Configuré

- **vitrine-quelyos**: 3-10 pods (CPU 70%, Mem 80%)
- **vitrine-client**: 3-15 pods (CPU 70%, Mem 80%)
- **dashboard-client**: 2-8 pods (CPU 70%, Mem 80%)
- **odoo**: 2 pods fixes (peut être augmenté manuellement)

### Vérifier HPA

```bash
kubectl get hpa -n quelyos
kubectl describe hpa vitrine-client-hpa -n quelyos
```

## 🌐 Ingress & DNS

### Configuration DNS

Pointer vos domaines vers le LoadBalancer du cluster :

```bash
# Obtenir IP externe Ingress
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

**Records DNS:**
```
quelyos.com           A    <INGRESS_IP>
www.quelyos.com       A    <INGRESS_IP>
shop.quelyos.com      A    <INGRESS_IP>
dashboard.quelyos.com A    <INGRESS_IP>
api.quelyos.com       A    <INGRESS_IP>
```

### TLS/SSL avec cert-manager

```bash
# Installer cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

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

Les certificats seront générés automatiquement par cert-manager.

## 💾 Backup & Restore

### Backup PostgreSQL

```bash
# Backup manuel
kubectl exec -n quelyos postgres-0 -- pg_dump -U quelyos quelyos > backup.sql

# Restore
kubectl exec -i -n quelyos postgres-0 -- psql -U quelyos quelyos < backup.sql
```

### Backup automatisé avec CronJob

Créer `k8s/base/backup-cronjob.yaml` :

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: quelyos
spec:
  schedule: "0 2 * * *"  # Tous les jours à 2h
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
              pg_dump -U quelyos -h postgres-service quelyos | \
              gzip > /backup/quelyos-$(date +%Y%m%d-%H%M%S).sql.gz
            volumeMounts:
            - name: backup
              mountPath: /backup
          restartPolicy: OnFailure
          volumes:
          - name: backup
            persistentVolumeClaim:
              claimName: backup-pvc
```

## 🔍 Monitoring

### Logs centralisés

```bash
# Tous les logs d'un service
kubectl logs -n quelyos -l app=vitrine-client --all-containers -f

# Logs d'erreur uniquement
kubectl logs -n quelyos -l app=odoo | grep ERROR
```

### Métriques

```bash
# CPU/Mem par pod
kubectl top pods -n quelyos

# Par node
kubectl top nodes
```

### Prometheus + Grafana (voir étape suivante)

Après ajout de Prometheus/Grafana, importer les dashboards :
- Kubernetes Cluster Monitoring
- Nginx Ingress Controller
- PostgreSQL Exporter

## 🔄 Rolling Update

```bash
# Update image (zero downtime)
kubectl set image deployment/vitrine-client -n quelyos \
  vitrine-client=quelyos/vitrine-client:v2.0

# Rollback
kubectl rollout undo deployment/vitrine-client -n quelyos

# Historique
kubectl rollout history deployment/vitrine-client -n quelyos
```

## 🚨 Troubleshooting

### Pods en CrashLoopBackOff

```bash
kubectl describe pod <pod-name> -n quelyos
kubectl logs <pod-name> -n quelyos --previous
```

### Services inaccessibles

```bash
# Vérifier endpoints
kubectl get endpoints -n quelyos

# Tester connectivité interne
kubectl run -it --rm debug --image=busybox --restart=Never -- sh
# Dans le pod : wget -O- http://odoo-service:8069/web/health
```

### PVC non montés

```bash
kubectl get pvc -n quelyos
kubectl describe pvc postgres-pvc -n quelyos
```

## 📝 Configuration Cloud Provider

### AWS EKS

```bash
# StorageClass gp3
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  fsType: ext4
volumeBindingMode: WaitForFirstConsumer
EOF

# Remplacer dans PVCs: storageClassName: gp3
```

### GCP GKE

```bash
# StorageClass premium-rwo
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: premium-rwo
provisioner: pd.csi.storage.gke.io
parameters:
  type: pd-ssd
volumeBindingMode: WaitForFirstConsumer
EOF

# Remplacer dans PVCs: storageClassName: premium-rwo
```

### Azure AKS

```bash
# StorageClass managed-premium
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: managed-premium
provisioner: disk.csi.azure.com
parameters:
  skuName: Premium_LRS
volumeBindingMode: WaitForFirstConsumer
EOF

# Remplacer dans PVCs: storageClassName: managed-premium
```

## 🎯 Prochaines Étapes

1. **CI/CD Integration** : GitHub Actions → Deploy K8s
2. **Observabilité** : Prometheus + Grafana
3. **Service Mesh** : Istio/Linkerd (optionnel)
4. **Network Policies** : Sécurité réseau
5. **Pod Security Standards** : Restricted mode
