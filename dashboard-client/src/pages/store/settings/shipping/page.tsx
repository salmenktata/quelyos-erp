import { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/common";
import { Button } from "@/components/common/Button";
import { useToast } from "@/contexts/ToastContext";
import { Truck, Save, Loader2, Clock, Gift, Info } from "lucide-react";
import { useSiteConfig, useUpdateSiteConfig } from "@/hooks/useSiteConfig";

export default function ShippingSettingsPage() {
  const toast = useToast();
  const { data: config, isLoading } = useSiteConfig();
  const updateMutation = useUpdateSiteConfig();

  const [shippingConfig, setShippingConfig] = useState({
    shipping_standard_days: "2-5",
    shipping_express_days: "1-2",
    free_shipping_threshold: 150,
  });

  useEffect(() => {
    if (config) {
      setShippingConfig({
        shipping_standard_days: config.shipping_standard_days || "2-5",
        shipping_express_days: config.shipping_express_days || "1-2",
        free_shipping_threshold: config.free_shipping_threshold || 150,
      });
    }
  }, [config]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(shippingConfig);
      toast.success("Configuration livraison mise à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Boutique", href: "/store" },
            { label: "Paramètres", href: "/store/settings" },
            { label: "Livraison", href: "/store/settings/shipping" },
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Boutique", href: "/store" },
          { label: "Paramètres", href: "/store/settings" },
          { label: "Livraison", href: "/store/settings/shipping" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-3">
            <Truck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Livraison
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Délais et seuil de livraison gratuite
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          icon={updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        >
          Enregistrer
        </Button>
      </div>

      <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Ces informations seront affichées sur les fiches produits et dans le panier.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="space-y-6">
          {/* Délai standard */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="h-4 w-4" />
              Délai livraison standard
            </label>
            <input
              type="text"
              value={shippingConfig.shipping_standard_days}
              onChange={(e) => setShippingConfig({ ...shippingConfig, shipping_standard_days: e.target.value })}
              placeholder="2-5"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Exemple : "2-5" pour 2 à 5 jours ouvrés.
            </p>
          </div>

          {/* Délai express */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Truck className="h-4 w-4" />
              Délai livraison express
            </label>
            <input
              type="text"
              value={shippingConfig.shipping_express_days}
              onChange={(e) => setShippingConfig({ ...shippingConfig, shipping_express_days: e.target.value })}
              placeholder="1-2"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Exemple : "1-2" pour 1 à 2 jours ouvrés.
            </p>
          </div>

          {/* Seuil livraison gratuite */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Gift className="h-4 w-4" />
              Seuil livraison gratuite
            </label>
            <div className="relative">
              <input
                type="number"
                value={shippingConfig.free_shipping_threshold}
                onChange={(e) => setShippingConfig({ ...shippingConfig, free_shipping_threshold: Number(e.target.value) })}
                min={0}
                step={10}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 pr-12 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                TND
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Montant minimum du panier pour bénéficier de la livraison gratuite. Mettre 0 pour désactiver.
            </p>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4">
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
              Aperçu client
            </p>
            <div className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
              <p>Livraison standard : {shippingConfig.shipping_standard_days} jours ouvrés</p>
              <p>Livraison express : {shippingConfig.shipping_express_days} jours ouvrés</p>
              {shippingConfig.free_shipping_threshold > 0 && (
                <p className="font-medium">
                  Livraison gratuite dès {shippingConfig.free_shipping_threshold} TND d'achat
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
