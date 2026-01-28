import { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/common";
import { Button } from "@/components/common/Button";
import { useToast } from "@/contexts/ToastContext";
import { ToggleLeft, Save, Loader2, Heart, Star, Layers, Mail , Info } from "lucide-react";
import { useSiteConfig, useUpdateSiteConfig } from "@/hooks/useSiteConfig";

interface FeatureToggle {
  key: keyof typeof featureLabels;
  enabled: boolean;
}

const featureLabels = {
  wishlist_enabled: {
    label: "Liste de souhaits",
    description: "Permettre aux clients de sauvegarder des produits pour plus tard.",
    icon: Heart,
  },
  reviews_enabled: {
    label: "Avis clients",
    description: "Afficher les avis et notes des clients sur les produits.",
    icon: Star,
  },
  compare_enabled: {
    label: "Comparateur de produits",
    description: "Permettre aux clients de comparer plusieurs produits côte à côte.",
    icon: Layers,
  },
  newsletter_enabled: {
    label: "Newsletter",
    description: "Afficher le formulaire d'inscription à la newsletter.",
    icon: Mail,
  },
};

export default function FeaturesSettingsPage() {
  const toast = useToast();
  const { data: config, isLoading } = useSiteConfig();
  const updateMutation = useUpdateSiteConfig();

  const [features, setFeatures] = useState({
    wishlist_enabled: true,
    reviews_enabled: true,
    compare_enabled: true,
    newsletter_enabled: true,
  });

  useEffect(() => {
    if (config) {
      setFeatures({
        wishlist_enabled: config.wishlist_enabled ?? true,
        reviews_enabled: config.reviews_enabled ?? true,
        compare_enabled: config.compare_enabled ?? true,
        newsletter_enabled: config.newsletter_enabled ?? true,
      });
    }
  }, [config]);

  const handleToggle = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(features);
      toast.success("Fonctionnalités mises à jour");
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
            { label: "Fonctionnalités", href: "/store/settings/features" },
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
          { label: "Fonctionnalités", href: "/store/settings/features" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-3">
            <ToggleLeft className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Fonctionnalités
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Activez ou désactivez les fonctionnalités de votre boutique
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
            Personnalisez l'expérience d'achat en activant ou désactivant des fonctionnalités.
          </p>
        </div>
      </div>

      {/* Feature toggles */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {(Object.keys(featureLabels) as (keyof typeof featureLabels)[]).map((key) => {
          const feature = featureLabels[key];
          const Icon = feature.icon;
          const isEnabled = features[key];

          return (
            <div
              key={key}
              className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-2 ${isEnabled ? "bg-indigo-100 dark:bg-indigo-900/30" : "bg-gray-100 dark:bg-gray-700"}`}>
                  <Icon className={`h-5 w-5 ${isEnabled ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {feature.label}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggle(key)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  isEnabled ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-600"
                }`}
                role="switch"
                aria-checked={isEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4">
        <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
          Résumé
        </p>
        <p className="text-sm text-indigo-800 dark:text-indigo-200">
          {Object.values(features).filter(Boolean).length} fonctionnalité(s) activée(s) sur {Object.keys(features).length}
        </p>
      </div>
    </div>
  );
}
