import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "8 Modules Intégrés — Données Synchronisées",
  description: "Découvrez les 8 modules Quelyos : Finance, Boutique, CRM, Stock, RH, POS, Marketing, Dashboard. Tous interconnectés, données synchronisées automatiquement.",
  keywords: ["modules ERP", "logiciel tout-en-un", "gestion intégrée", "Finance", "CRM", "Stock", "RH", "POS", "Marketing"],
  openGraph: {
    title: "8 Modules Quelyos — Tout votre business en un seul endroit",
    description: "Une vente = stock mis à jour + revenu Finance + fiche client enrichie. Automatique.",
    url: "https://quelyos.com/modules",
  },
};

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
