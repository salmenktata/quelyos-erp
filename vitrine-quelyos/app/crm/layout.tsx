import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM — Pipeline & Facturation",
  description: "CRM complet pour TPE/PME. Pipeline de ventes visuel, fiches clients 360°, devis et factures automatiques, synchronisation avec Finance. Essai gratuit.",
  keywords: ["CRM", "gestion clients", "pipeline ventes", "facturation", "devis", "relation client", "TPE", "PME", "suivi commercial"],
  openGraph: {
    title: "Quelyos CRM — Gérez vos clients et ventes",
    description: "Pipeline visuel, fiches 360°, devis → factures en un clic. CRM intégré à votre ERP.",
    url: "https://quelyos.com/crm",
  },
};

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
