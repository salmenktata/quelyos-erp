import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Point de Vente — Caisse Moderne",
  description: "Caisse enregistreuse moderne pour commerces et restaurants. Terminal tactile, Click & Collect, mode rush, écran cuisine. Synchronisation stock temps réel.",
  keywords: ["caisse enregistreuse", "point de vente", "POS", "terminal tactile", "Click & Collect", "restauration", "commerce", "TPE"],
  openGraph: {
    title: "Quelyos POS — Caisse moderne pour commerces",
    description: "Terminal tactile, Click & Collect, mode rush, écran cuisine. Caisse intégrée à votre ERP.",
    url: "https://quelyos.com/pos",
  },
};

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
