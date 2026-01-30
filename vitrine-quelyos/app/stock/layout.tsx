import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock — Inventaire Multi-Entrepôts",
  description: "Gestion de stock temps réel pour TPE/PME. Multi-sites, alertes seuils, valorisation FIFO/LIFO, scan codes-barres. Synchronisation automatique avec Boutique.",
  keywords: ["gestion stock", "inventaire", "multi-entrepôts", "valorisation stock", "codes-barres", "alertes stock", "TPE", "PME"],
  openGraph: {
    title: "Quelyos Stock — Inventaire temps réel",
    description: "Multi-entrepôts, alertes automatiques, valorisation FIFO/LIFO. Stock synchronisé avec vos ventes.",
    url: "https://quelyos.com/stock",
  },
};

export default function StockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
