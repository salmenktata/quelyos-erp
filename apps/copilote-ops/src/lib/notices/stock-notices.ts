import { Boxes, ClipboardList, ArrowLeftRight, Truck, Warehouse, MapPin, RefreshCcw, Lightbulb, Layers, Shuffle, TrendingUp } from 'lucide-react';
import type { PageNoticeConfig } from './types';

export const stockNotices: Record<string, PageNoticeConfig> = {
  products: {
    pageId: 'stock-products',
    title: 'Stock & Disponibilité',
    purpose: "Visualisez en temps réel le niveau de stock de tous vos produits, identifiez les ruptures ou surstocks, et ajustez rapidement les quantités pour garantir la disponibilité des articles.",
    icon: Boxes,
    moduleColor: 'orange',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Configurez des seuils min/max adaptés à la rotation',
        'Utilisez les alertes "Stock faible" pour anticiper les ruptures',
        'Exportez régulièrement pour des analyses complémentaires ou audits',
        'Ajustez via le modal pour tracer les mouvements',
        'Activez un inventaire périodique pour corriger les écarts',
      ]
    }]
  },

  inventory: {
    pageId: 'stock-inventory',
    title: 'Inventaire Physique',
    purpose: "Organisez et suivez vos campagnes d'inventaire physique pour garantir la cohérence entre stock théorique et réel.",
    icon: ClipboardList,
    moduleColor: 'orange',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Planifiez des inventaires réguliers : complet annuel + tournants mensuels',
        'Saisissez les quantités réelles : le système calcule les écarts',
        'Analysez les écarts avant validation',
        'Validez pour ajuster le stock automatiquement',
      ]
    }]
  },

  moves: {
    pageId: 'stock-moves',
    title: 'Mouvements de Stock',
    purpose: "Historique exhaustif de tous les mouvements de stock pour tracer chaque variation.",
    icon: ArrowLeftRight,
    moduleColor: 'orange',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Filtrez par période, produit ou emplacement',
        'Surveillez les ajustements fréquents',
        'Exportez pour croiser avec la comptabilité',
      ]
    }]
  },

  transfers: {
    pageId: 'stock-transfers',
    title: 'Transferts entre Entrepôts',
    purpose: "Gérez les transferts de marchandises entre vos différents entrepôts ou emplacements.",
    icon: Truck,
    moduleColor: 'orange',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Créez un transfert pour tout mouvement entre sites',
        'Validez la réception à destination',
        'Suivez les transferts "En transit"',
      ]
    }]
  },

  warehouses: {
    pageId: 'stock-warehouses',
    title: 'Gestion des Entrepôts',
    purpose: "Administrez vos entrepôts et sites de stockage : configuration, emplacements, règles de réapprovisionnement.",
    icon: Warehouse,
    moduleColor: 'orange',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Structurez vos entrepôts par fonction',
        'Définissez des règles de réapprovisionnement par entrepôt',
        'Suivez le taux de remplissage par entrepôt',
      ]
    }]
  },

  locations: {
    pageId: 'stock-locations',
    title: 'Emplacements de Stock',
    purpose: "Organisez vos emplacements de stockage pour optimiser le picking et la traçabilité.",
    icon: MapPin,
    moduleColor: 'orange',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Créez une hiérarchie claire : Entrepôt > Zone > Allée > Rayon',
        'Affectez les produits à rotation rapide aux emplacements accessibles',
        'Utilisez les emplacements virtuels pour stock spécial',
      ]
    }]
  },

  reorderingRules: {
    pageId: 'stock-reordering-rules',
    title: 'Règles de Réapprovisionnement',
    purpose: "Automatisez le réapprovisionnement en définissant des règles min/max pour chaque produit.",
    icon: RefreshCcw,
    moduleColor: 'orange',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Configurez min = stock sécurité + demande pendant délai fournisseur',
        'Activez le calcul automatique basé sur historique de ventes',
        'Révisez trimestriellement selon la saisonnalité',
      ]
    }]
  },

  valuation: {
    pageId: 'stock-valuation',
    title: 'Valorisation du Stock',
    purpose: "Analysez la valeur financière de votre inventaire en temps réel.",
    icon: Layers,
    moduleColor: 'orange',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Suivez la valorisation par entrepôt',
        'Analysez la répartition par catégorie',
        'Identifiez les produits dormants pour libérer du cash',
      ]
    }]
  },

  turnover: {
    pageId: 'stock-turnover',
    title: 'Rotation du Stock',
    purpose: "Mesurez la vitesse de rotation de vos produits pour optimiser les achats.",
    icon: Shuffle,
    moduleColor: 'orange',
    sections: [
      {
        title: 'Comprendre les statuts',
        icon: TrendingUp,
        items: [
          'Excellent (>=12) : Rotation optimale',
          'Bon (6-12) : Performance saine',
          'Lent (2-6) : À surveiller',
          'Dormant (<2) : Action requise',
        ]
      },
      {
        title: 'Bonnes pratiques',
        icon: Lightbulb,
        items: [
          'Analysez sur 90 jours minimum',
          'Segmentez par catégorie',
          'Identifiez les produits dormants',
        ]
      }
    ]
  },
};
