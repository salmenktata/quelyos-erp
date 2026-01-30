import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RH — SIRH Complet pour PME",
  description: "SIRH complet pour TPE/PME. Gestion employés, congés en ligne, pointage digital, évaluations annuelles, organigramme. Essai gratuit 30 jours.",
  keywords: ["SIRH", "RH", "ressources humaines", "gestion congés", "pointage", "évaluations", "TPE", "PME", "gestion personnel"],
  openGraph: {
    title: "Quelyos RH — SIRH complet pour PME",
    description: "Employés, congés, pointage, évaluations. Tout le SIRH intégré à votre ERP.",
    url: "https://quelyos.com/hr",
  },
};

export default function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
