'use client';

import React, { useMemo } from 'react';
import { PaymentForm, PaymentMethod } from './PaymentForm';
import { useActivePaymentProviders, PaymentProvider } from '@/hooks/usePaymentProviders';
import { Loader2 } from 'lucide-react';

interface PaymentFormWithProvidersProps {
  onSubmit: (methodId: string) => void;
  onBack: () => void;
  isLoading?: boolean;
  orderId?: number;
  orderAmount?: number;
  customerData?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  includeLocalMethods?: boolean; // Include cash_on_delivery, bank_transfer
}

/**
 * PaymentForm wrapper that fetches active payment providers from backend
 * and merges them with local payment methods
 */
export const PaymentFormWithProviders: React.FC<PaymentFormWithProvidersProps> = ({
  onSubmit,
  onBack,
  isLoading = false,
  orderId,
  orderAmount,
  customerData,
  includeLocalMethods = true,
}) => {
  const { data: providers, isLoading: providersLoading, error } = useActivePaymentProviders();

  // Map backend providers to PaymentMethod format
  const providerMethods: PaymentMethod[] = useMemo(() => {
    if (!providers) return [];

    return providers.map((provider: PaymentProvider) => {
      let description = '';

      switch (provider.code) {
        case 'stripe':
          description = 'Visa, Mastercard, American Express';
          break;
        case 'flouci':
          description = 'Solution de paiement mobile tunisienne';
          break;
        case 'konnect':
          description = 'Gateway multi-méthodes (wallet, carte, D17)';
          break;
        default:
          description = provider.name;
      }

      return {
        id: `provider_${provider.id}`,
        name: provider.name,
        description,
        icon: provider.code,
        code: provider.code,
        providerId: provider.id,
      };
    });
  }, [providers]);

  // Local payment methods (cash on delivery, bank transfer)
  const localMethods: PaymentMethod[] = includeLocalMethods
    ? [
        {
          id: 'cash_on_delivery',
          name: 'Paiement à la livraison',
          description: 'Payez en espèces lors de la réception',
          icon: 'cash',
        },
        {
          id: 'bank_transfer',
          name: 'Virement bancaire',
          description: 'Paiement par virement',
          icon: 'transfer',
        },
      ]
    : [];

  // Merge provider methods with local methods
  const allMethods = [...providerMethods, ...localMethods];

  if (providersLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mr-3" />
        <span className="text-gray-600 dark:text-gray-400">
          Chargement des moyens de paiement...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <p className="text-red-800 dark:text-red-300 font-semibold mb-2">
          Erreur de chargement
        </p>
        <p className="text-red-600 dark:text-red-400 text-sm">
          Impossible de charger les moyens de paiement. Veuillez réessayer.
        </p>
      </div>
    );
  }

  if (allMethods.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <p className="text-yellow-800 dark:text-yellow-300 font-semibold mb-2">
          Aucun moyen de paiement disponible
        </p>
        <p className="text-yellow-600 dark:text-yellow-400 text-sm">
          Veuillez contacter le support pour activer les moyens de paiement.
        </p>
      </div>
    );
  }

  return (
    <PaymentForm
      methods={allMethods}
      onSubmit={onSubmit}
      onBack={onBack}
      isLoading={isLoading}
      orderId={orderId}
      orderAmount={orderAmount}
      customerData={customerData}
    />
  );
};

export default PaymentFormWithProviders;
