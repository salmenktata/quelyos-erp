import { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/common";
import { Button } from "@/components/common/Button";
import { useToast } from "@/contexts/ToastContext";
import { Palette, Save, Loader2, Info } from "lucide-react";
import { useSiteConfig, useUpdateSiteConfig } from "@/hooks/useSiteConfig";

export default function BrandSettingsPage() {
  const toast = useToast();
  const { data: config, isLoading } = useSiteConfig();
  const updateMutation = useUpdateSiteConfig();

  const [brandConfig, setBrandConfig] = useState({
    brand_name: "",
    logo_url: "",
    primary_color: "#4f46e5",
    secondary_color: "#7c3aed",
  });

  useEffect(() => {
    if (config) {
      setBrandConfig({
        brand_name: (config as any).brand_name || "",
        logo_url: (config as any).logo_url || "",
        primary_color: (config as any).primary_color || "#4f46e5",
        secondary_color: (config as any).secondary_color || "#7c3aed",
      });
    }
  }, [config]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(brandConfig as any);
      toast.success("Identité de marque mise à jour");
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
            { label: "Marque & Identité", href: "/store/settings/brand" },
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
          { label: "Marque & Identité", href: "/store/settings/brand" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-3">
            <Palette className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Marque & Identité
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Personnalisez le nom, le logo et les couleurs de votre boutique
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
            Ces paramètres définissent l'apparence de votre boutique en ligne pour vos clients.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="space-y-6">
          {/* Nom de la marque */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom de la marque
            </label>
            <input
              type="text"
              value={brandConfig.brand_name}
              onChange={(e) => setBrandConfig({ ...brandConfig, brand_name: e.target.value })}
              placeholder="Ma Boutique"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Ce nom apparaîtra dans l'en-tête et le pied de page du site.
            </p>
          </div>

          {/* URL du logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL du logo
            </label>
            <input
              type="url"
              value={brandConfig.logo_url}
              onChange={(e) => setBrandConfig({ ...brandConfig, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Format recommandé : PNG ou SVG transparent, 200x60 pixels minimum.
            </p>
          </div>

          {/* Couleurs */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Couleur principale
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandConfig.primary_color}
                  onChange={(e) => setBrandConfig({ ...brandConfig, primary_color: e.target.value })}
                  className="h-10 w-14 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={brandConfig.primary_color}
                  onChange={(e) => setBrandConfig({ ...brandConfig, primary_color: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Utilisée pour les boutons et liens principaux.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Couleur secondaire
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandConfig.secondary_color}
                  onChange={(e) => setBrandConfig({ ...brandConfig, secondary_color: e.target.value })}
                  className="h-10 w-14 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={brandConfig.secondary_color}
                  onChange={(e) => setBrandConfig({ ...brandConfig, secondary_color: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Utilisée pour les accents et éléments secondaires.
              </p>
            </div>
          </div>

          {/* Preview */}
          {brandConfig.logo_url && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aperçu du logo
              </label>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                <img
                  src={brandConfig.logo_url}
                  alt="Logo preview"
                  className="max-h-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
