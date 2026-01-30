import { Sparkles } from 'lucide-react';
import type { PageNoticeConfig } from './types';

export const aiConfigNotices: PageNoticeConfig = {
  pageId: 'admin-ai-config',
  title: 'Configuration IA Chat Assistant',
  purpose:
    'Gérer les providers IA (Groq, Claude, OpenAI) utilisés pour le chat assistant Quelyos avec chiffrement sécurisé des API keys.',
  icon: Sparkles,
  moduleColor: 'indigo',
  sections: [
    {
      title: 'Gestion Providers',
      items: [
        'Ajouter/éditer/supprimer des providers IA (Groq gratuit recommandé)',
        'Activer/désactiver des providers avec système de priorité pour fallback',
        'Configurer modèle, température, max_tokens par provider',
        'Tester connexion en temps réel avant activation',
        'API keys chiffrées avec Fernet (AES-128-CBC + HMAC-SHA256)',
      ],
    },
    {
      title: 'Métriques & Monitoring',
      items: [
        'Suivi total requêtes et taux de succès par provider',
        'Latence moyenne et coûts cumulés en temps réel',
        'Comparaison performance entre providers (vitesse, qualité)',
        'Historique tests connexion avec timestamps',
      ],
    },
    {
      title: 'Providers Disponibles',
      items: [
        'Groq (Gratuit) : 14400 req/jour, Llama 3.1 70B, ~300 tokens/s',
        'Claude : Anthropic Claude 3.5 Sonnet, qualité premium',
        'OpenAI : GPT-4 Turbo, alternative robuste',
        'Fallback automatique sur keywords si tous les providers échouent',
      ],
    },
    {
      title: 'Sécurité',
      items: [
        'Droits Super Admin (base.group_system) requis',
        'API keys JAMAIS exposées au frontend (masquées sk-...****)',
        'Clé de chiffrement stockée dans variable env backend',
        'Audit logs pour toute création/modification/suppression',
      ],
    },
    {
      title: 'Configuration Recommandée',
      items: [
        'Provider principal : Groq (gratuit, ultra-rapide)',
        'Backup : Claude ou OpenAI si budget disponible',
        'Priorité 1 = highest (utilisé en premier)',
        'Tester connexion avant activation pour éviter erreurs production',
      ],
    },
  ],
};
