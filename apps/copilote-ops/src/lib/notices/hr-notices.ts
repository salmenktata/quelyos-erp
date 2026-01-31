import {
  Users,
  Building2,
  FileText,
  CalendarOff,
  Clock,
  UserCheck,
  Briefcase,
  Calendar,
  PieChart,
  Tag,
  Settings,
  ClipboardCheck,
  Layers,
  type LucideIcon,
} from 'lucide-react';
import type { PageNoticeConfig } from './types';

export const hrNotices: Record<string, PageNoticeConfig> = {
  dashboard: {
    pageId: 'hr-dashboard',
    title: 'Tableau de bord RH',
    purpose: "Vue d'ensemble de votre équipe : effectifs, présences, congés et contrats.",
    icon: Users as LucideIcon,
    moduleColor: 'orange',
    sections: [
      {
        title: 'Indicateurs clés',
        icon: UserCheck,
        items: [
          'Effectif total et répartition par département',
          'Suivi des présences en temps réel',
          'Alertes pour congés en attente de validation',
          'Contrats arrivant à échéance sous 30 jours',
        ],
      },
    ],
  },

  employees: {
    pageId: 'hr-employees',
    title: 'Gestion des employés',
    purpose: "Centralisez les informations de vos collaborateurs.",
    icon: Users as LucideIcon,
    moduleColor: 'orange',
    sections: [
      {
        title: 'Fonctionnalités',
        icon: Briefcase,
        items: [
          'Fiches employés complètes',
          'Historique des contrats et avenants',
          'Suivi des présences et absences',
        ],
      },
    ],
  },

  departments: {
    pageId: 'hr-departments',
    title: 'Départements',
    purpose: "Organisez votre structure avec des départements et une hiérarchie claire.",
    icon: Building2 as LucideIcon,
    moduleColor: 'orange',
    sections: [
      {
        title: 'Organisation',
        icon: Building2,
        items: [
          'Création et gestion des départements',
          'Affectation des responsables',
          'Visualisation de la répartition des effectifs',
        ],
      },
    ],
  },

  contracts: {
    pageId: 'hr-contracts',
    title: 'Contrats',
    purpose: "Gérez les contrats de travail : types, durées, renouvellements et échéances.",
    icon: FileText as LucideIcon,
    moduleColor: 'orange',
    sections: [
      {
        title: 'Suivi des contrats',
        icon: FileText,
        items: [
          'Création de contrats CDI, CDD, stage',
          'Alertes automatiques avant échéance',
          'Historique des avenants',
        ],
      },
    ],
  },

  leaves: {
    pageId: 'hr-leaves',
    title: 'Congés',
    purpose: "Gérez les demandes de congés, les validations et le suivi des soldes.",
    icon: CalendarOff as LucideIcon,
    moduleColor: 'orange',
    sections: [
      {
        title: 'Gestion des congés',
        icon: CalendarOff,
        items: [
          'Demandes de congés avec workflow de validation',
          'Différents types de congés paramétrables',
          'Suivi des soldes et allocations',
        ],
      },
    ],
  },

  attendance: {
    pageId: 'hr-attendance',
    title: 'Présences',
    purpose: "Suivez les entrées/sorties et le temps de travail.",
    icon: Clock as LucideIcon,
    moduleColor: 'orange',
    sections: [
      {
        title: 'Pointage',
        icon: Clock,
        items: [
          'Enregistrement des heures',
          'Calcul automatique des heures travaillées',
          'Suivi des retards et absences',
        ],
      },
    ],
  },

  jobs: {
    pageId: 'hr-jobs',
    title: 'Postes',
    purpose: "Définissez les postes de votre organisation.",
    icon: Briefcase as LucideIcon,
    moduleColor: 'orange',
    sections: [
      {
        title: 'Gestion des postes',
        icon: Briefcase,
        items: [
          'Création et description des postes',
          'Rattachement aux départements',
          'Compétences requises',
        ],
      },
    ],
  },

  settings: {
    pageId: 'hr-settings',
    title: 'Paramètres RH',
    purpose: "Configurez le module RH selon les besoins de votre organisation.",
    icon: Settings as LucideIcon,
    moduleColor: 'orange',
    sections: [
      {
        title: 'Configuration',
        icon: Settings,
        items: [
          'Format des matricules employés',
          'Règles de pointage et présences',
          'Types de congés et allocations',
          'Notifications et alertes RH',
        ],
      },
    ],
  },

  leavesCalendar: {
    pageId: 'hr-leaves-calendar',
    title: 'Calendrier des congés',
    purpose: "Visualisez les absences sur un calendrier partagé.",
    icon: Calendar as LucideIcon,
    moduleColor: 'orange',
    sections: [
      {
        title: 'Planification',
        icon: Calendar,
        items: [
          'Vue mensuelle des absences',
          'Filtrage par département ou employé',
          'Détection des chevauchements',
        ],
      },
    ],
  },

  leavesAllocations: {
    pageId: 'hr-leaves-allocations',
    title: 'Allocations de congés',
    purpose: "Gérez les droits à congés de vos employés.",
    icon: PieChart as LucideIcon,
    moduleColor: 'orange',
    sections: [
      {
        title: 'Droits à congés',
        icon: PieChart,
        items: [
          'Attribution des jours par type de congé',
          'Suivi des soldes restants',
          'Report des jours non pris',
        ],
      },
    ],
  },

  leavesTypes: {
    pageId: 'hr-leaves-types',
    title: 'Types de congés',
    purpose: "Configurez les différents types de congés disponibles.",
    icon: Tag as LucideIcon,
    moduleColor: 'orange',
    sections: [
      {
        title: 'Paramétrage',
        icon: Tag,
        items: [
          'Création de types personnalisés',
          'Règles de validation par type',
          'Couleurs pour le calendrier',
        ],
      },
    ],
  },

  appraisals: {
    pageId: 'hr-appraisals',
    title: 'Évaluations',
    purpose: "Gérez les entretiens annuels et bilans de performance.",
    icon: ClipboardCheck as LucideIcon,
    moduleColor: 'orange',
    sections: [
      {
        title: 'Suivi des évaluations',
        icon: ClipboardCheck,
        items: [
          'Planification des entretiens annuels',
          'Suivi des objectifs et performances',
          'Historique des évaluations',
        ],
      },
    ],
  },

  skills: {
    pageId: 'hr-skills',
    title: 'Compétences',
    purpose: "Gérez le référentiel de compétences.",
    icon: Layers as LucideIcon,
    moduleColor: 'orange',
    sections: [
      {
        title: 'Référentiel',
        icon: Layers,
        items: [
          'Types de compétences',
          'Catalogue de compétences',
          'Association aux postes et employés',
        ],
      },
    ],
  },
};
