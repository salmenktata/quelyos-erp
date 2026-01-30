import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "CGU Quelyos. Conditions d'utilisation de la plateforme, droits et obligations des utilisateurs.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CGULayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
