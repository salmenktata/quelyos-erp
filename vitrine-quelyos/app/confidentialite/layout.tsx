import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité",
  description: "Politique de confidentialité Quelyos. Protection des données personnelles, RGPD, droits des utilisateurs.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ConfidentialiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
