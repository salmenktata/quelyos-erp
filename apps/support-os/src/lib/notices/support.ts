import type { PageNoticeConfig } from './types'
import { Ticket, PlusCircle } from 'lucide-react'

export const supportNotices: Record<string, PageNoticeConfig> = {
  tickets: {
    pageId: 'support-tickets',
    title: 'Gestion des Tickets',
    purpose: 'Suivez et g\u00E9rez les demandes de support client',
    icon: Ticket,
    moduleColor: 'violet',
    sections: [
      {
        title: 'Fonctionnalit\u00E9s',
        items: [
          'Liste des tickets avec filtres par statut, priorit\u00E9 et cat\u00E9gorie',
          'Recherche avanc\u00E9e par r\u00E9f\u00E9rence, sujet ou client',
          'Actions rapides : assigner, changer statut, prioriser',
        ],
      },
    ],
  },
  newTicket: {
    pageId: 'support-new-ticket',
    title: 'Cr\u00E9er un Ticket',
    purpose: 'Cr\u00E9ez une nouvelle demande de support',
    icon: PlusCircle,
    moduleColor: 'violet',
    sections: [
      {
        title: 'Informations',
        items: [
          'Sujet et description de la demande',
          'Cat\u00E9gorie et priorit\u00E9',
          'Pi\u00E8ces jointes',
        ],
      },
    ],
  },
}
