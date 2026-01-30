import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secteurs d'Activité — Solutions Métiers",
  description: "Quelyos adapté à votre secteur : Commerce & Retail, Restauration, Services B2B, Artisans. Modules recommandés selon votre activité.",
  keywords: ["ERP restauration", "ERP commerce", "ERP services", "ERP artisans", "logiciel métier", "solution sectorielle"],
  openGraph: {
    title: "Quelyos par Secteur — Solutions adaptées à votre métier",
    description: "Commerce, Restauration, Services, Artisans. Des modules recommandés selon votre activité.",
    url: "https://quelyos.com/secteurs",
  },
};

export default function SecteursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
