import { PageNoticeConfig } from './types'

export const supportNotices: Record<string, PageNoticeConfig> = {
  tickets: {
    pageId: 'support-tickets',
    title: 'Centre d\'assistance',
    purpose: 'Créez et suivez vos demandes de support',
    sections: [
      {
        title: 'Informations',
        icon: 'info',
        items: [
          'Notre équipe répond sous 24h en semaine',
          'Les tickets urgents sont traités en priorité',
          'Vous recevez une notification à chaque réponse',
        ],
      },
      {
        title: 'Conseils',
        icon: 'lightbulb',
        items: [
          'Choisissez la bonne catégorie pour une réponse rapide',
          'Ajoutez des captures d\'écran si possible',
          'Indiquez la priorité selon l\'urgence réelle',
        ],
      },
    ],
    moduleColor: 'violet',
  },
  newTicket: {
    pageId: 'support-new-ticket',
    title: 'Créer un ticket',
    purpose: 'Décrivez votre problème ou votre question',
    sections: [
      {
        title: 'Informations requises',
        icon: 'clipboard',
        items: [
          'Catégorie : Aide à orienter votre demande',
          'Priorité : Urgente, Haute, Moyenne ou Basse',
          'Description détaillée : Plus c\'est précis, mieux c\'est',
        ],
      },
    ],
    moduleColor: 'violet',
  },
}
