import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description: "CGV Quelyos. Conditions de vente, tarifs, modalités de paiement et garanties.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CGVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
