import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boutique — E-commerce Omnicanal",
  description: "E-commerce omnicanal pour TPE/PME. Catalogue produits, commandes WhatsApp/Instagram, facturation auto, synchronisation stock et Finance.",
  keywords: ["e-commerce", "boutique en ligne", "vente en ligne", "WhatsApp commerce", "Instagram shopping", "catalogue produits", "TPE", "PME"],
  openGraph: {
    title: "Quelyos Boutique — E-commerce omnicanal",
    description: "Vendez partout : site, WhatsApp, Instagram. Stock et trésorerie synchronisés automatiquement.",
    url: "https://quelyos.com/ecommerce",
  },
};

export default function EcommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
