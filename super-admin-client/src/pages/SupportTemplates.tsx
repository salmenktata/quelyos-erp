/**
 * Gestion Templates Support - Super Admin
 *
 * Fonctionnalités :
 * - Liste des templates de réponse pré-écrits
 * - Créer nouveau template
 * - Modifier template existant
 * - Supprimer template
 * - Filtres par catégorie
 * - Prévisualisation HTML
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Eye,
  Loader2,
} from 'lucide-react'
import { api } from '@/lib/api/gateway'
import { useToast } from '@/hooks/useToast'

export interface Template {
  id: number
  name: string
  content: string
  category: string
  sequence: number
  active: boolean
  created_at: string
}

const CATEGORIES = [
  { value: 'technical', label: 'Technique' },
  { value: 'billing', label: 'Facturation' },
  { value: 'account', label: 'Compte' },
  { value: 'product', label: 'Produit' },
  { value: 'shipping', label: 'Livraison' },
  { value: 'other', label: 'Autre' },
]

export function SupportTemplates() {
  const queryClient = useQueryClient()
  const toast = useToast()

  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formCategory, setFormCategory] = useState('other')
  const [formSequence, setFormSequence] = useState(10)

  // Query templates
  const { data, isLoading } = useQuery({
    queryKey: ['super-admin-templates'],
    queryFn: async () => {
      const response = await api.request<{ success: boolean; templates: Template[] }>({
        method: 'GET',
        path: '/api/super-admin/templates',
      })
      return response.data
    },
  })

  // Mutation créer
  const createMutation = useMutation({
    mutationFn: async (template: { name: string; content: string; category: string; sequence: number }) => {
      return api.request({
        method: 'POST',
        path: '/api/super-admin/templates',
        body: template,
      })
    },
    onSuccess: () => {
      toast.success('Template créé avec succès')
      queryClient.invalidateQueries({ queryKey: ['super-admin-templates'] })
      handleCloseModal()
    },
    onError: () => {
      toast.error('Erreur lors de la création')
    },
  })

  // Mutation modifier
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...template }: { id: number; name: string; content: string; category: string; sequence: number }) => {
      return api.request({
        method: 'PUT',
        path: `/api/super-admin/templates/${id}`,
        body: template,
      })
    },
    onSuccess: () => {
      toast.success('Template modifié avec succès')
      queryClient.invalidateQueries({ queryKey: ['super-admin-templates'] })
      handleCloseModal()
    },
    onError: () => {
      toast.error('Erreur lors de la modification')
    },
  })

  // Mutation supprimer
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.request({
        method: 'DELETE',
        path: `/api/super-admin/templates/${id}`,
      })
    },
    onSuccess: () => {
      toast.success('Template supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['super-admin-templates'] })
    },
    onError: () => {
      toast.error('Erreur lors de la suppression')
    },
  })

  const handleCreate = () => {
    setEditingTemplate(null)
    setFormName('')
    setFormContent('')
    setFormCategory('other')
    setFormSequence(10)
    setShowModal(true)
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setFormName(template.name)
    setFormContent(template.content)
    setFormCategory(template.category)
    setFormSequence(template.sequence)
    setShowModal(true)
  }

  const handleDelete = async (template: Template) => {
    if (!confirm(`Supprimer le template "${template.name}" ?`)) return
    await deleteMutation.mutateAsync(template.id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const templateData = {
      name: formName,
      content: formContent,
      category: formCategory,
      sequence: formSequence,
    }

    if (editingTemplate) {
      await updateMutation.mutateAsync({ id: editingTemplate.id, ...templateData })
    } else {
      await createMutation.mutateAsync(templateData)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTemplate(null)
  }

  // Filtrer templates
  const filteredTemplates = data?.templates.filter(t =>
    categoryFilter === 'all' || t.category === categoryFilter
  ) || []

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Templates Support
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gérer les réponses pré-écrites pour les tickets de support
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
        >
          <Plus className="w-4 h-4" />
          Créer template
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Catégorie
        </label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">Toutes les catégories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Liste templates */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {filteredTemplates.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Aucun template trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Séquence
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTemplates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {CATEGORIES.find(c => c.value === template.category)?.label || template.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {template.sequence}
                      </td>
                      <td className="px-6 py-4 text-right text-sm space-x-2">
                        <button
                          onClick={() => setPreviewTemplate(template)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </button>
                        <button
                          onClick={() => handleEdit(template)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded"
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(template)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Créer/Modifier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header modal */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingTemplate ? 'Modifier le template' : 'Créer un template'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du template *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catégorie
                  </label>
                  <select
                    id="category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="sequence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Séquence
                  </label>
                  <input
                    id="sequence"
                    type="number"
                    value={formSequence}
                    onChange={(e) => setFormSequence(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contenu (HTML accepté) *
                </label>
                <textarea
                  id="content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Utilisez du HTML pour formater le contenu (balises autorisées : p, br, strong, em, ul, li)
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingTemplate ? 'Modifier' : 'Créer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Prévisualisation */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {previewTemplate.name}
              </h2>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: previewTemplate.content }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
