import type { PageNoticeConfig } from './types'
import { Users } from 'lucide-react'

export const crmNotices: Record<string, PageNoticeConfig> = {
  customers: {
    pageId: 'crm-customers',
    title: 'Gestion des Clients',
    purpose: 'G\u00E9rez votre base de contacts et clients',
    icon: Users,
    moduleColor: 'violet',
    sections: [
      {
        title: 'Fonctionnalit\u00E9s',
        items: [
          'Liste compl\u00E8te des clients avec recherche et filtres',
          'Fiche d\u00E9taill\u00E9e par client',
          'Export des donn\u00E9es clients',
        ],
      },
    ],
  },
}
