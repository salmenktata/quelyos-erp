"use client";

import { usePathname } from "next/navigation";
import ChatBot from "./ChatBot";

/**
 * Wrapper pour afficher le ChatBot sur toutes les pages sauf /support
 * (la page support a son propre chatbot intégré)
 */
export default function ConditionalChatBot() {
  const pathname = usePathname();

  // Ne pas afficher le chatbot sur la page support (a déjà le sien)
  if (pathname === "/support") {
    return null;
  }

  return <ChatBot />;
}
