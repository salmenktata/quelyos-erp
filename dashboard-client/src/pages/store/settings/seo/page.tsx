import { useState, useEffect } from "react";
import { Breadcrumbs } from "@/components/common";
import { Button } from "@/components/common/Button";
import { useToast } from "@/contexts/ToastContext";
import { Search, Save, Loader2, Globe, FileText, Image , Info } from "lucide-react";
import { useSiteConfig, useUpdateSiteConfig } from "@/hooks/useSiteConfig";

export default function SeoSettingsPage() {
  const toast = useToast();
  const { data: config, isLoading } = useSiteConfig();
  const updateMutation = useUpdateSiteConfig();

  const [seoConfig, setSeoConfig] = useState({
    site_title: "",
    meta_description: "",
    meta_keywords: "",
    og_image_url: "",
  });

  useEffect(() => {
    if (config) {
      setSeoConfig({
        site_title: (config as any).site_title || "",
        meta_description: (config as any).meta_description || "",
        meta_keywords: (config as any).meta_keywords || "",
        og_image_url: (config as any).og_image_url || "",
      });
    }
  }, [config]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(seoConfig as any);
      toast.success("Paramètres SEO mis à jour");
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
            { label: "SEO", href: "/store/settings/seo" },
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
          { label: "SEO", href: "/store/settings/seo" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-3">
            <Search className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              SEO
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Optimisation pour les moteurs de recherche
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
            Ces métadonnées aident les moteurs de recherche à comprendre votre site et améliorent votre visibilité.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="space-y-6">
          {/* Titre du site */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Globe className="h-4 w-4" />
              Titre du site
            </label>
            <input
              type="text"
              value={seoConfig.site_title}
              onChange={(e) => setSeoConfig({ ...seoConfig, site_title: e.target.value })}
              placeholder="Ma Boutique - Vente en ligne de produits"
              maxLength={70}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="mt-1 flex justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Apparaît dans l'onglet du navigateur et les résultats de recherche.
              </p>
              <span className={`text-xs ${seoConfig.site_title.length > 60 ? "text-amber-600" : "text-gray-400"}`}>
                {seoConfig.site_title.length}/70
              </span>
            </div>
          </div>

          {/* Meta description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="h-4 w-4" />
              Meta description
            </label>
            <textarea
              value={seoConfig.meta_description}
              onChange={(e) => setSeoConfig({ ...seoConfig, meta_description: e.target.value })}
              placeholder="Découvrez notre sélection de produits de qualité. Livraison rapide et service client réactif."
              maxLength={160}
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
            <div className="mt-1 flex justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Description affichée dans les résultats de recherche Google.
              </p>
              <span className={`text-xs ${seoConfig.meta_description.length > 150 ? "text-amber-600" : "text-gray-400"}`}>
                {seoConfig.meta_description.length}/160
              </span>
            </div>
          </div>

          {/* Mots-clés */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Search className="h-4 w-4" />
              Mots-clés
            </label>
            <input
              type="text"
              value={seoConfig.meta_keywords}
              onChange={(e) => setSeoConfig({ ...seoConfig, meta_keywords: e.target.value })}
              placeholder="boutique en ligne, e-commerce, produits, vente"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Séparez les mots-clés par des virgules. Usage limité par les moteurs modernes.
            </p>
          </div>

          {/* Image Open Graph */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Image className="h-4 w-4" />
              Image de partage (Open Graph)
            </label>
            <input
              type="url"
              value={seoConfig.og_image_url}
              onChange={(e) => setSeoConfig({ ...seoConfig, og_image_url: e.target.value })}
              placeholder="https://example.com/og-image.jpg"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Image affichée lors du partage sur les réseaux sociaux. Format recommandé : 1200x630 pixels.
            </p>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Aperçu Google
            </p>
            <div className="space-y-1">
              <p className="text-lg text-blue-700 dark:text-blue-400 hover:underline cursor-pointer truncate">
                {seoConfig.site_title || "Titre de votre site"}
              </p>
              <p className="text-sm text-green-700 dark:text-green-500 truncate">
                https://votreboutique.com
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {seoConfig.meta_description || "La description de votre site apparaîtra ici dans les résultats de recherche."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
