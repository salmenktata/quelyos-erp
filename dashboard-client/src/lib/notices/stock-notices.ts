import { Boxes, ClipboardList, ArrowLeftRight, Truck, Warehouse, MapPin, RefreshCcw, Lightbulb } from 'lucide-react';
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
        'Configurez des seuils min/max adaptés à la rotation : seuil min = stock sécurité + qté vendue pendant délai fournisseur',
        'Utilisez les alertes "Stock faible" pour anticiper les ruptures avant qu\'elles impactent les ventes',
        'Exportez régulièrement l\'état du stock (Excel/CSV) pour des analyses complémentaires ou audits',
        'Ajustez via le modal pour tracer les mouvements : évitez les modifications directes dans Odoo',
        'Activez l\'inventaire périodique (mensuel ou trimestriel) pour corriger les écarts physique/théorique',
      ]
    }]
  },

  inventory: {
    pageId: 'stock-inventory',
    title: 'Inventaire Physique',
    purpose: "Organisez et suivez vos campagnes d'inventaire physique pour garantir la cohérence entre stock théorique et réel. Identifiez et corrigez les écarts rapidement.",
    icon: ClipboardList,
    moduleColor: 'orange',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Planifiez des inventaires réguliers : inventaire complet annuel + inventaires tournants mensuels par zone',
        'Imprimez les listes de comptage via export Excel pour faciliter le travail terrain',
        'Saisissez les quantités réelles dans le backoffice : le système calcule automatiquement les écarts',
        'Analysez les écarts avant validation : identifiez les causes (casse, vol, erreur saisie)',
        'Validez l\'inventaire pour ajuster le stock : les mouvements d\'ajustement sont tracés automatiquement',
      ]
    }]
  },

  moves: {
    pageId: 'stock-moves',
    title: 'Mouvements de Stock',
    purpose: "Consultez l'historique exhaustif de tous les mouvements de stock (entrées, sorties, ajustements, transferts) pour tracer l'origine de chaque variation et garantir l'auditabilité.",
    icon: ArrowLeftRight,
    moduleColor: 'orange',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Filtrez par période, produit ou emplacement pour analyser des flux spécifiques',
        'Surveillez les types de mouvements : les ajustements fréquents révèlent des dysfonctionnements',
        'Exportez les mouvements pour croiser avec la comptabilité ou les audits qualité',
        'Vérifiez la cohérence : tout mouvement doit avoir une origine identifiée (commande, transfert, inventaire)',
        'Utilisez les références de picking/livraison pour remonter aux documents sources',
      ]
    }]
  },

  transfers: {
    pageId: 'stock-transfers',
    title: 'Transferts entre Entrepôts',
    purpose: "Gérez les transferts de marchandises entre vos différents entrepôts ou emplacements. Suivez l'état des transferts en cours et l'historique des mouvements inter-sites.",
    icon: Truck,
    moduleColor: 'orange',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Créez un transfert pour tout mouvement entre sites : garantit la traçabilité complète',
        'Validez la réception à l\'arrivée : évite les décalages entre sites expéditeur et destinataire',
        'Suivez les transferts "En transit" : alertez si délai anormal (perte, erreur logistique)',
        'Utilisez les références uniques pour faciliter le suivi multi-sites',
        'Analysez les flux inter-sites pour optimiser la répartition du stock',
      ]
    }]
  },

  warehouses: {
    pageId: 'stock-warehouses',
    title: 'Gestion des Entrepôts',
    purpose: "Administrez vos entrepôts et sites de stockage : configuration, emplacements, règles de réapprovisionnement. Visualisez le stock par entrepôt pour optimiser la répartition.",
    icon: Warehouse,
    moduleColor: 'orange',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Structurez vos entrepôts par fonction : stock principal, showroom, SAV, zones de picking',
        'Configurez les routes et séquences de picking adaptées à votre activité',
        'Définissez des règles de réapprovisionnement par entrepôt selon la demande locale',
        'Suivez le taux de remplissage par entrepôt : évitez saturation ou sous-utilisation',
        'Activez les emplacements hiérarchiques pour faciliter l\'organisation physique',
      ]
    }]
  },

  locations: {
    pageId: 'stock-locations',
    title: 'Emplacements de Stock',
    purpose: "Organisez vos emplacements de stockage (allées, rayons, casiers) pour optimiser le picking et la traçabilité. Visualisez le stock par emplacement et gérez les mouvements internes.",
    icon: MapPin,
    moduleColor: 'orange',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Créez une hiérarchie claire : Entrepôt > Zone > Allée > Rayon > Casier',
        'Nommez les emplacements de façon logique : A01-R02-C03 pour faciliter le repérage',
        'Affectez les produits à rotation rapide aux emplacements les plus accessibles',
        'Utilisez les emplacements virtuels pour stock endommagé, en contrôle qualité, etc.',
        'Scannez les emplacements lors des mouvements pour garantir la fiabilité',
      ]
    }]
  },

  reorderingRules: {
    pageId: 'stock-reordering-rules',
    title: 'Règles de Réapprovisionnement',
    purpose: "Automatisez le réapprovisionnement en définissant des règles (min/max, point de commande) pour chaque produit. Le système génère automatiquement les bons de commande fournisseur.",
    icon: RefreshCcw,
    moduleColor: 'orange',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Configurez min = stock sécurité + demande pendant délai fournisseur, max = min + lot économique',
        'Activez le calcul automatique : le système suggère les règles selon historique de ventes',
        'Révisez trimestriellement les règles : ajustez selon saisonnalité ou changements de rotation',
        'Testez les règles sur quelques produits avant généralisation pour valider les paramètres',
        'Surveillez les alertes de stock mini : déclenchent automatiquement les commandes fournisseurs',
      ]
    }]
  },
};
