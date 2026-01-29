'use client';

import { useState } from 'react';
import type { ThemeContextValue } from '../../../../engine/types';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function Accordion({ config, className = '', theme }: AccordionProps) {
  const title = (config?.title as string) || 'Questions Fréquentes';
  const subtitle = (config?.subtitle as string) || 'Trouvez rapidement les réponses à vos questions';

  // Mock data (sera remplacé par données backend)
  const faqs: FAQItem[] = (config?.faqs as FAQItem[]) || [
    {
      question: 'Quels sont les délais de livraison ?',
      answer: 'Nous livrons sous 2 à 5 jours ouvrables pour la Tunisie. Pour les commandes internationales, comptez entre 7 et 14 jours selon la destination.',
    },
    {
      question: 'Comment puis-je retourner un produit ?',
      answer: 'Vous disposez de 14 jours pour retourner un produit. Contactez notre service client pour obtenir une étiquette de retour. Le produit doit être dans son emballage d\'origine.',
    },
    {
      question: 'Acceptez-vous les paiements en plusieurs fois ?',
      answer: 'Oui, nous proposons le paiement en 3 fois sans frais pour toute commande supérieure à 300 TND. Cette option est disponible à la dernière étape du paiement.',
    },
    {
      question: 'Mes données sont-elles sécurisées ?',
      answer: 'Absolument. Nous utilisons le protocole SSL pour crypter toutes les transactions. Vos données bancaires ne sont jamais stockées sur nos serveurs.',
    },
    {
      question: 'Puis-je modifier ma commande après validation ?',
      answer: 'Si votre commande n\'a pas encore été expédiée, vous pouvez la modifier en contactant notre service client sous 24h. Une fois expédiée, seul un retour est possible.',
    },
    {
      question: 'Proposez-vous un programme de fidélité ?',
      answer: 'Oui ! Chaque achat vous permet de cumuler des points convertibles en bons d\'achat. Inscrivez-vous à notre newsletter pour bénéficier d\'offres exclusives.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`py-16 md:py-24 bg-white dark:bg-gray-900 ${className}`}>
      <div
        className="container mx-auto px-4"
        style={{ maxWidth: theme.spacing.containerWidth }}
      >
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
            style={{ fontFamily: `var(--theme-font-headings)` }}
          >
            {title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all"
              style={{
                borderColor: openIndex === index ? theme.colors.primary : undefined,
              }}
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between p-6 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  size={24}
                  className={`flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  style={{ color: theme.colors.primary }}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="p-6 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Vous ne trouvez pas la réponse à votre question ?
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
            style={{
              backgroundColor: theme.colors.primary,
              color: '#ffffff',
            }}
          >
            Contactez-nous
          </a>
        </div>
      </div>
    </section>
  );
}
