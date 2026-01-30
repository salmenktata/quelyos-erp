import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales",
  description: "Mentions légales du site Quelyos. Informations sur l'éditeur, l'hébergeur et les conditions d'utilisation.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function MentionsLegalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
