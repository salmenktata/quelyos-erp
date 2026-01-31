import { Monitor, ClipboardList, Clock, BarChart3, CreditCard, Settings, Printer, Lightbulb, Package, Sparkles } from 'lucide-react';
import type { PageNoticeConfig } from './types';

export const posNotices: Record<string, PageNoticeConfig> = {
  dashboard: {
    pageId: 'pos-dashboard',
    title: 'Point de Vente',
    purpose: "Tableau de bord central pour suivre en temps réel l'activité des caisses : ventes du jour, sessions actives, et performances par terminal.",
    icon: Monitor,
    moduleColor: 'teal',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        `Vérifiez chaque matin les sessions actives et les terminaux disponibles`,
        `Surveillez le panier moyen pour ajuster les stratégies de vente additionnelle`,
        `Clôturez les sessions en fin de journée pour générer les rapports Z`,
        `Utilisez les KPIs pour identifier les heures de pointe et optimiser le personnel`,
      ]
    }]
  },

  orders: {
    pageId: 'pos-orders',
    title: 'Historique des Commandes',
    purpose: "Consultez et gérez toutes les ventes effectuées en caisse. Recherchez par référence, client ou date pour le suivi et les remboursements.",
    icon: ClipboardList,
    moduleColor: 'teal',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        `Utilisez la recherche pour retrouver rapidement une commande par référence`,
        `Exportez les données régulièrement pour la comptabilité`,
        `Vérifiez l'état des paiements avant tout remboursement`,
        `Identifiez les produits les plus vendus via les filtres par article`,
      ]
    }]
  },

  sessions: {
    pageId: 'pos-sessions',
    title: 'Sessions de Caisse',
    purpose: "Gérez le cycle de vie des sessions : ouverture avec fond de caisse, suivi des ventes, et clôture avec rapport Z pour la comptabilité.",
    icon: Clock,
    moduleColor: 'teal',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        `Comptez physiquement le fond de caisse avant chaque ouverture de session`,
        `Clôturez les sessions en fin de service, jamais plusieurs jours ouverts`,
        `Comparez le montant théorique et réel lors de la clôture`,
        `Conservez les rapports Z pour la traçabilité comptable`,
      ]
    }]
  },

  reportsSales: {
    pageId: 'pos-reports-sales',
    title: 'Rapports de Ventes',
    purpose: "Analysez les performances commerciales du point de vente : chiffre d'affaires, évolution, top produits et comparaisons par période.",
    icon: BarChart3,
    moduleColor: 'teal',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        `Comparez les ventes semaine par semaine pour identifier les tendances`,
        `Identifiez les produits à forte marge via le rapport par article`,
        `Analysez les heures de pointe pour optimiser les plannings`,
        `Exportez les rapports pour les réunions d'équipe`,
      ]
    }]
  },

  reportsPayments: {
    pageId: 'pos-reports-payments',
    title: 'Rapports de Paiements',
    purpose: "Suivez la répartition des encaissements par méthode de paiement : espèces, cartes, paiements digitaux et autres.",
    icon: CreditCard,
    moduleColor: 'teal',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        `Vérifiez la cohérence entre le rapport et les relevés bancaires`,
        `Identifiez les méthodes de paiement préférées de vos clients`,
        `Surveillez les commissions par type de paiement`,
        `Réconciliez les espèces avec le comptage physique`,
      ]
    }]
  },

  settings: {
    pageId: 'pos-settings',
    title: 'Configuration POS',
    purpose: "Configurez tous les aspects du module Point de Vente : terminaux, méthodes de paiement et personnalisation des tickets.",
    icon: Settings,
    moduleColor: 'teal',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        `Créez un terminal par poste de caisse physique`,
        `Activez uniquement les méthodes de paiement réellement utilisées`,
        `Personnalisez les tickets avec vos informations légales`,
        `Testez l'impression avant la mise en production`,
      ]
    }]
  },

  terminals: {
    pageId: 'pos-settings-terminals',
    title: 'Terminaux',
    purpose: "Configurez vos points de vente physiques : nom, entrepôt associé, méthodes de paiement acceptées et options spécifiques.",
    icon: Monitor,
    moduleColor: 'teal',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        `Nommez clairement chaque terminal (ex: Caisse 1, Terrasse, Kiosque)`,
        `Associez chaque terminal à son entrepôt pour la gestion de stock`,
        `Activez le mode kiosque pour les bornes libre-service`,
        `Configurez les droits d'accès par utilisateur`,
      ]
    }]
  },

  payments: {
    pageId: 'pos-settings-payments',
    title: 'Méthodes de Paiement',
    purpose: "Gérez les moyens de paiement acceptés en caisse et leur configuration : espèces, cartes, paiements mobiles.",
    icon: CreditCard,
    moduleColor: 'teal',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        `Activez uniquement les méthodes configurées avec votre prestataire`,
        `Configurez l'ouverture automatique du tiroir-caisse pour les espèces`,
        `Testez chaque méthode avant la mise en service`,
        `Désactivez temporairement une méthode en cas de problème technique`,
      ]
    }]
  },

  receipts: {
    pageId: 'pos-settings-receipts',
    title: 'Tickets de Caisse',
    purpose: "Personnalisez l'apparence et le contenu des tickets : en-tête avec logo, pied de page, et sélection du type d'imprimante.",
    icon: Printer,
    moduleColor: 'teal',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        `Incluez les mentions légales obligatoires (SIRET, TVA)`,
        `Ajoutez vos coordonnées et horaires d'ouverture`,
        `Testez l'impression sur papier thermique avant la mise en production`,
        `Personnalisez le message de remerciement`,
      ]
    }]
  },

  clickCollect: {
    pageId: 'pos-click-collect',
    title: 'Click & Collect',
    purpose: "Gérez les commandes web à retirer en magasin : préparation, notification client et remise des commandes.",
    icon: Package,
    moduleColor: 'teal',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        `Préparez les commandes dès réception pour respecter les délais`,
        `Notifiez le client dès que la commande est prête`,
        `Vérifiez le code de retrait avant remise`,
        `Rangez les commandes prêtes dans une zone dédiée`,
      ]
    }]
  },

  sessionOpen: {
    pageId: 'pos-session-open',
    title: 'Ouverture de Session',
    purpose: "Démarrez une nouvelle session de caisse en sélectionnant le terminal et en déclarant le fond de caisse.",
    icon: Clock,
    moduleColor: 'teal',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        `Comptez physiquement le fond de caisse avant de le déclarer`,
        `Choisissez le terminal correspondant à votre poste de travail`,
        `Vérifiez qu'aucune session n'est déjà ouverte sur ce terminal`,
        `En cas d'erreur sur le montant, fermez et rouvrez la session`,
      ]
    }]
  },

  analytics: {
    pageId: 'pos-analytics',
    title: 'Analytics Prédictifs',
    purpose: "Dashboard avancé avec prédictions de ventes basées sur l'IA, alertes de stock et tendances produits.",
    icon: Sparkles,
    moduleColor: 'teal',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        `Consultez les prédictions en début de journée pour anticiper l'affluence`,
        `Surveillez les alertes de réapprovisionnement pour éviter les ruptures`,
        `Identifiez les produits en tendance pour optimiser les mises en avant`,
        `Comparez les prédictions aux ventes réelles pour affiner le modèle`,
      ]
    }]
  },
};
