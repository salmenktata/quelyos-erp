import { useEffect, useState } from "react";
import { ModularLayout } from "@/components/ModularLayout";
import { api } from "@/lib/finance/api";
import type { CreateCategoryRequest } from "@/types/api";
import { useRequireAuth } from "@/lib/finance/compat/auth";
import { PageHeader } from "@/components/finance/PageHeader";
import { Button } from "@/components/ui/button";
import { TagIcon, PlusIcon } from "@heroicons/react/24/outline";

type Category = {
  id: number;
  name: string;
  companyId: number;
  kind: "INCOME" | "EXPENSE";
};

export default function CategoriesPage() {
  useRequireAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function fetchCategories() {
    try {
      setError(null);
      const data = await api<Category[]>("/categories");
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur de chargement des catégories."
      );
    }
  }

  async function createCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api("/categories", {
        method: "POST",
        body: { name, kind } as CreateCategoryRequest,
      });

      setName("");
      setKind("EXPENSE");
      setShowForm(false);
      await fetchCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de créer la catégorie."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const incomeCategories = categories.filter((c) => c.kind === "INCOME");
  const expenseCategories = categories.filter((c) => c.kind === "EXPENSE");

  return (
    <ModularLayout>
      <div className="p-8 space-y-6">
        <PageHeader
          icon={TagIcon}
          title="Catégories"
          description="Organisez vos transactions par catégories pour un suivi clair"
          breadcrumbs={[
            { label: "Finance", href: "/finance" },
            { label: "Catégories" },
          ]}
          actions={
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => setShowForm(!showForm)}
            >
              <PlusIcon className="h-5 w-5" />
              {showForm ? "Annuler" : "Nouvelle catégorie"}
            </Button>
          }
        />

        {/* Formulaire de création */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <form onSubmit={createCategory} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Créer une catégorie
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    htmlFor="category-name"
                  >
                    Nom de la catégorie
                  </label>
                  <input
                    id="category-name"
                    type="text"
                    placeholder="Ex: Charges fixes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    htmlFor="category-kind"
                  >
                    Type
                  </label>
                  <select
                    id="category-kind"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={kind}
                    onChange={(e) => setKind(e.target.value as "INCOME" | "EXPENSE")}
                  >
                    <option value="EXPENSE">Dépense</option>
                    <option value="INCOME">Revenu</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Création..." : "Créer la catégorie"}
                </Button>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Liste des catégories */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Catégories de revenus */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Revenus
                </h2>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {incomeCategories.length} catégorie{incomeCategories.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {incomeCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {cat.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {cat.id}
                  </span>
                </div>
              ))}
              {incomeCategories.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucune catégorie de revenus
                </div>
              )}
            </div>
          </div>

          {/* Catégories de dépenses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dépenses
                </h2>
                <span className="rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300">
                  {expenseCategories.length} catégorie{expenseCategories.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {expenseCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {cat.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {cat.id}
                  </span>
                </div>
              ))}
              {expenseCategories.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucune catégorie de dépenses
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModularLayout>
  );
}
