# Guide : Améliorer la Connaissance du Chatbot

## 🎯 Méthode 1 : Enrichir la FAQ (Simple & Gratuit)

### Pourquoi ?
- ✅ Réponses instantanées (< 50ms)
- ✅ 100% gratuit (pas d'appel API)
- ✅ Contrôle total sur le contenu
- ✅ Cohérence garantie

### Comment ajouter une question ?

**Fichier** : `lib/ai_faq.py`

```python
FAQ_ENTRIES.append({
    "keywords": [
        "mot-clé 1",
        "mot-clé 2",
        "phrase complète à détecter"
    ],
    "question": "Question affichée dans la liste FAQ",
    "answer": """Réponse détaillée ici.

Vous pouvez utiliser :
- Des listes
- Des **markdown**
- Plusieurs paragraphes

💡 Astuce : Plus la réponse est détaillée, mieux c'est !"""
})
```

### Exemples de nouvelles FAQ à ajouter

#### 1. Migration de données
```python
{
    "keywords": ["migrer", "importer données", "migration", "transfert"],
    "question": "Comment migrer mes données vers Quelyos ?",
    "answer": """Quelyos facilite la migration de vos données :

**📥 Import Manuel**
- CSV, Excel (XLSX)
- Mapping des colonnes automatique
- Prévisualisation avant import

**🔄 Import Automatisé**
- API REST complète
- Connecteurs ERP (Sage, Cegid, etc.)
- Scripts de migration personnalisés

**🤝 Migration Assistée** (plan Entreprise)
- Équipe dédiée
- Migration complète clé en main
- Formation incluse

Contactez notre support : support@quelyos.com"""
}
```

#### 2. Performance & Scalabilité
```python
{
    "keywords": ["performance", "rapidité", "lenteur", "scalabilité", "croissance"],
    "question": "Quelyos peut-il gérer une forte croissance ?",
    "answer": """Quelyos est conçu pour évoluer avec votre entreprise :

**⚡ Performance**
- Cache Redis intégré
- CDN mondial (Cloudflare)
- Temps de réponse < 200ms

**📈 Scalabilité**
- Infrastructure auto-scalable
- Pas de limite d'utilisateurs (plan Pro+)
- Données illimitées (plan Entreprise)

**📊 Clients Références**
- 50 à 500 collaborateurs
- Milliers de transactions/jour
- Multi-sites supporté

Quelyos grandit avec vous, sans migration !"""
}
```

#### 3. Mobile
```python
{
    "keywords": ["mobile", "smartphone", "tablette", "android", "ios", "app"],
    "question": "Y a-t-il une application mobile ?",
    "answer": """Quelyos est 100% responsive et accessible sur mobile :

**📱 Version Web Mobile**
- Interface optimisée tablette/smartphone
- Pas d'installation nécessaire
- Accès via navigateur

**🚀 Progressive Web App (PWA)**
- Installation sur écran d'accueil
- Fonctionne hors-ligne (lecture)
- Notifications push

**📲 Applications Natives** (2026)
- iOS & Android en développement
- Disponible Q2 2026
- Inscrivez-vous à la beta : beta@quelyos.com

En attendant, la version web mobile est parfaitement utilisable !"""
}
```

#### 4. Conformité & Certifications
```python
{
    "keywords": ["conformité", "certification", "norme", "iso", "rgpd", "légal"],
    "question": "Quelles sont les certifications de Quelyos ?",
    "answer": """Quelyos respecte les normes les plus strictes :

**🔐 Sécurité**
- ISO 27001 (hébergeur certifié)
- HDS (Hébergeur de Données de Santé)
- PCI-DSS (paiements sécurisés)

**📋 Conformité**
- RGPD (UE)
- Loi française sur les données
- Export FEC (comptabilité)

**🇫🇷 Souveraineté**
- Hébergement 100% France
- Données en Europe uniquement
- Support en français

**📜 Audits**
- Audit sécurité annuel
- Pentest externe trimestriel
- Certifications à jour

Demandez nos certificats : conformite@quelyos.com"""
}
```

---

## 🧠 Méthode 2 : RAG (Retrieval Augmented Generation)

**Avantages** : Connaissance dynamique, toujours à jour

### Architecture RAG

```
┌─────────────┐
│   Message   │
│  Utilisateur│
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Recherche dans  │
│ Base Vectorielle│ ← Documentation, Articles, FAQ, etc.
└──────┬──────────┘
       │ (Top 3-5 résultats pertinents)
       ▼
┌─────────────────┐
│  System Prompt  │
│  + Contexte RAG │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Groq/Claude   │
│   Génération    │
└──────┬──────────┘
       │
       ▼
    Réponse
```

### Implémentation Basique

**1. Installer les dépendances**
```bash
pip install sentence-transformers chromadb
```

**2. Créer la base vectorielle**

Fichier : `lib/ai_rag.py`

```python
from sentence_transformers import SentenceTransformer
import chromadb

# Initialiser le modèle d'embedding
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# Base vectorielle
client = chromadb.Client()
collection = client.create_collection("quelyos_knowledge")

# Indexer la documentation
docs = [
    {
        "id": "doc_1",
        "text": "Quelyos Finance permet de gérer la trésorerie avec IA...",
        "metadata": {"module": "finance", "type": "feature"}
    },
    {
        "id": "doc_2",
        "text": "Pour créer une facture, allez dans Finance > Facturation...",
        "metadata": {"module": "finance", "type": "tutorial"}
    }
    # ... ajouter toute votre documentation
]

# Indexer
for doc in docs:
    embedding = model.encode(doc["text"]).tolist()
    collection.add(
        embeddings=[embedding],
        documents=[doc["text"]],
        metadatas=[doc["metadata"]],
        ids=[doc["id"]]
    )

# Recherche
def search_knowledge(query: str, n_results: int = 3):
    """Recherche dans la base de connaissances."""
    query_embedding = model.encode(query).tolist()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    return results['documents'][0]
```

**3. Intégrer dans le chatbot**

Modifier `controllers/ai_public.py` :

```python
from ..lib.ai_rag import search_knowledge

# Dans la méthode chat(), avant l'appel IA :
if not faq_response:
    # Chercher dans la base de connaissances
    context_docs = search_knowledge(clean_message)

    # Enrichir le system prompt
    enriched_prompt = f"""{SYSTEM_PROMPT_STRICT}

CONTEXTE PERTINENT :
{chr(10).join(context_docs)}

Utilise ce contexte pour répondre à la question de l'utilisateur."""

    # Passer enriched_prompt au lieu de SYSTEM_PROMPT_STRICT
```

---

## 📚 Méthode 3 : Indexer la Documentation

**Sources de connaissance à indexer** :

### 1. Documentation Officielle
```python
# Scraper la doc Quelyos
docs_sources = [
    "https://quelyos.com/docs/finance",
    "https://quelyos.com/docs/crm",
    "https://quelyos.com/docs/stock",
    # etc.
]
```

### 2. Base Odoo (Produits, Features)
```python
def index_odoo_products():
    """Indexe tous les produits Odoo dans la base RAG."""
    Products = env['product.template'].sudo()
    products = Products.search([])

    for product in products:
        doc_text = f"""
        Produit : {product.name}
        Description : {product.description_sale or ''}
        Prix : {product.list_price} €
        Catégorie : {product.categ_id.name}
        """
        # Indexer dans ChromaDB
```

### 3. Articles de Blog / Actualités
```python
# Indexer automatiquement les nouveaux articles
def index_blog_post(post):
    embedding = model.encode(post.content).tolist()
    collection.add(
        embeddings=[embedding],
        documents=[post.content],
        metadatas=[{"title": post.title, "date": post.date}],
        ids=[f"blog_{post.id}"]
    )
```

---

## 🎨 Méthode 4 : Améliorer le System Prompt

**Fichier** : `lib/ai_security.py`

### Prompt actuel (générique)
```python
SYSTEM_PROMPT_STRICT = """Vous êtes l'assistant Quelyos..."""
```

### Prompt enrichi (spécialisé)
```python
SYSTEM_PROMPT_EXPERT = """Vous êtes l'assistant expert Quelyos, spécialiste de l'ERP français.

🎯 VOTRE EXPERTISE :
- 8 modules intégrés (Finance, CRM, Stock, E-commerce, RH, POS, Marketing)
- Architecture SaaS moderne (Next.js, React, Odoo 19)
- Hébergement souverain France
- Conformité RGPD & ISO 27001

💡 STYLE DE RÉPONSE :
- Professionnel mais accessible
- Exemples concrets
- Chiffres et données précises
- Toujours proposer une action (lien, contact, demo)

📋 MODULES DÉTAILLÉS :

**Quelyos Finance**
- Trésorerie IA (prévisions 90j)
- Factures & Devis
- Rapprochement bancaire automatique
- Export FEC
→ Tarif : Inclus dès 49€/mois

**Quelyos CRM**
- Pipeline des ventes
- Gestion opportunités
- Historique client 360°
→ Intégré nativement avec Finance

[... détailler tous les modules]

🔍 EXEMPLES DE RÉPONSES ATTENDUES :

Question : "Comment suivre ma trésorerie ?"
Réponse : "Quelyos Finance intègre un module de trésorerie avec IA qui :
1. Prévoit votre solde sur 90 jours
2. Alerte si risque de découvert
3. Suggère des optimisations

Pour y accéder : Dashboard > Finance > Trésorerie
Démo vidéo : https://quelyos.com/demo/tresorerie

Besoin d'aide pour paramétrer ? Je peux vous guider !"

RAPPEL SÉCURITÉ :
[... garder les règles de sécurité existantes]
"""
```

---

## 📊 Méthode 5 : Analytics & Amélioration Continue

### Tracker les questions non répondues

**Fichier** : `lib/ai_analytics.py`

```python
def log_unanswered_question(message: str, user_ip: str):
    """Log les questions qui n'ont pas trouvé de réponse FAQ."""
    # Stocker en DB pour analyse
    env['quelyos.ai.unanswered'].sudo().create({
        'message': message,
        'user_ip': user_ip,
        'date': fields.Datetime.now()
    })

# Créer un modèle Odoo quelyos.ai.unanswered
class AiUnanswered(models.Model):
    _name = 'quelyos.ai.unanswered'
    _description = 'Questions sans réponse FAQ'

    message = fields.Text(required=True)
    user_ip = fields.Char()
    date = fields.Datetime()
    frequency = fields.Integer(default=1)  # Combien de fois posée
```

### Dashboard Analytics

Créer une vue pour analyser :
- Top 10 des questions les plus posées
- Questions sans réponse FAQ
- Taux de satisfaction
- Sources de réponse (FAQ vs IA)

---

## 🚀 Méthode 6 : Context Injection Dynamique

Injecter du contexte depuis Odoo en temps réel :

```python
def get_user_context(user_ip: str):
    """Récupère le contexte utilisateur."""
    # Si utilisateur connecté
    if request.session.uid:
        user = env['res.users'].browse(request.session.uid)
        return f"""
        L'utilisateur est connecté :
        - Nom : {user.name}
        - Plan : {user.company_id.subscription_plan}
        - Modules actifs : {user.company_id.enabled_modules}

        Personnalisez votre réponse selon son plan et ses modules.
        """
    return ""

# Dans ai_public.py, enrichir le prompt :
context = get_user_context(user_ip)
final_prompt = f"{SYSTEM_PROMPT_STRICT}\n\n{context}"
```

---

## 📈 Roadmap Recommandée

### Phase 1 : Immédiat (Cette semaine)
- ✅ Enrichir FAQ (ajouter 10-20 questions courantes)
- ✅ Améliorer system prompt (version experte)
- ✅ Logger questions sans réponse

### Phase 2 : Court terme (Ce mois)
- 📚 Indexer documentation existante
- 🧠 Implémenter RAG basique
- 📊 Dashboard analytics

### Phase 3 : Moyen terme (3 mois)
- 🎯 RAG avancé (ChromaDB + embeddings)
- 🤖 Context injection dynamique
- 📱 Widget de feedback utilisateur

### Phase 4 : Long terme (6+ mois)
- 🔬 Fine-tuning modèle personnalisé
- 🌍 Multi-langue (EN, ES)
- 🧪 A/B testing différents prompts

---

## 💡 Quick Wins (À faire maintenant)

**1. Ajouter 5 FAQ immédiatement** (15 minutes)
**2. Enrichir le system prompt** (30 minutes)
**3. Logger les questions** (1 heure)

Total : **< 2 heures pour 3x meilleure connaissance !**

---

**Quelle méthode voulez-vous que je vous aide à implémenter en premier ?**

1. Enrichir la FAQ (le plus rapide)
2. Améliorer le system prompt
3. Implémenter RAG basique
4. Logger les questions non répondues
