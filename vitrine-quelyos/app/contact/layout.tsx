import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Demandez une démo",
  description: "Contactez l'équipe Quelyos pour une démo gratuite ou des questions. Support francophone, réponse sous 24h.",
  keywords: ["contact Quelyos", "démo ERP", "demande information", "support client"],
  openGraph: {
    title: "Contactez Quelyos — Démo gratuite",
    description: "Demandez une démo personnalisée ou posez vos questions. Support francophone.",
    url: "https://quelyos.com/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
