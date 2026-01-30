import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finance — Trésorerie & Prévisions IA",
  description: "Pilotez votre trésorerie TPE/PME avec l'IA. Prévisions fiables à 85-90% sur 90 jours, multi-comptes, rapports PDF, export FEC. Essai gratuit 30 jours.",
  keywords: ["trésorerie", "prévisions IA", "gestion financière", "TPE", "PME", "budget", "cash flow", "BFR", "tableau de bord financier"],
  openGraph: {
    title: "Quelyos Finance — Trésorerie & Prévisions IA",
    description: "Dormez tranquille : votre trésorerie TPE pilotée 90 jours à l'avance grâce à l'IA.",
    url: "https://quelyos.com/finance",
  },
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
