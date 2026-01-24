import { useState } from 'react'
import { Layout } from '../components/Layout'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories'
import { Button, Input, Modal, Breadcrumbs, SkeletonTable } from '../components/common'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/common/Toast'

export default function Categories() {
  const { data: categoriesData, isLoading, error } = useCategories()
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()

  const toast = useToast()

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: '', parent_id: '' })
  const [deleteModal, setDeleteModal] = useState<{ id: number; name: string } | null>(null)

  const categories = categoriesData?.data?.categories || []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      await createCategoryMutation.mutateAsync({
        name: formData.name,
        parent_id: formData.parent_id ? Number(formData.parent_id) : undefined,
      })
      toast.success(`La catégorie "${formData.name}" a été créée avec succès`)
      setFormData({ name: '', parent_id: '' })
      setIsCreating(false)
    } catch (error) {
      toast.error('Erreur lors de la création de la catégorie')
    }
  }

  const handleUpdate = async (id: number) => {
    if (!formData.name.trim()) return

    try {
      await updateCategoryMutation.mutateAsync({
        id,
        data: {
          name: formData.name,
          parent_id: formData.parent_id ? Number(formData.parent_id) : null,
        },
      })
      toast.success(`La catégorie "${formData.name}" a été modifiée avec succès`)
      setFormData({ name: '', parent_id: '' })
      setEditingId(null)
    } catch (error) {
      toast.error('Erreur lors de la modification de la catégorie')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return

    try {
      await deleteCategoryMutation.mutateAsync(deleteModal.id)
      toast.success(`La catégorie "${deleteModal.name}" a été supprimée avec succès`)
      setDeleteModal(null)
    } catch (error) {
      toast.error('Erreur lors de la suppression de la catégorie')
    }
  }

  const startEdit = (category: { id: number; name: string; parent_id: number | null }) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      parent_id: category.parent_id?.toString() || '',
    })
    setIsCreating(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({ name: '', parent_id: '' })
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Tableau de bord', href: '/dashboard' },
            { label: 'Catégories' },
          ]}
        />

        {/* En-tête */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catégories</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {categories.length} catégorie{categories.length > 1 ? 's' : ''}
            </p>
          </div>
          {!isCreating && !editingId && (
            <Button
              variant="primary"
              onClick={() => setIsCreating(true)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Nouvelle catégorie
            </Button>
          )}
        </div>

        {/* Contenu */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <SkeletonTable rows={5} columns={3} />
          ) : error ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400">
              Erreur lors du chargement des catégories
            </div>
          ) : (
            <>
              {/* Formulaire de création */}
              {isCreating && (
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Nouvelle catégorie
                  </h3>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nom"
                        id="create-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Vêtements"
                        required
                      />
                      <div>
                        <label htmlFor="create-parent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Catégorie parente
                        </label>
                        <select
                          id="create-parent"
                          value={formData.parent_id}
                          onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none"
                        >
                          <option value="">Aucune (catégorie racine)</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={createCategoryMutation.isPending}
                        disabled={createCategoryMutation.isPending}
                      >
                        Créer
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={cancelEdit}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Liste des catégories */}
              {categories.length === 0 && !isCreating ? (
                <div className="p-8 text-center">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Aucune catégorie
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Créez votre première catégorie pour organiser vos produits
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setIsCreating(true)}
                  >
                    Créer une catégorie
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`p-6 ${
                        editingId === category.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      } transition-colors`}
                    >
                      {editingId === category.id ? (
                        // Mode édition
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleUpdate(category.id)
                          }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Nom"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                            />
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Catégorie parente
                              </label>
                              <select
                                value={formData.parent_id}
                                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none"
                              >
                                <option value="">Aucune (catégorie racine)</option>
                                {categories
                                  .filter((cat) => cat.id !== category.id)
                                  .map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="submit"
                              variant="primary"
                              loading={updateCategoryMutation.isPending}
                              disabled={updateCategoryMutation.isPending}
                            >
                              Enregistrer
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={cancelEdit}
                            >
                              Annuler
                            </Button>
                          </div>
                        </form>
                      ) : (
                        // Mode affichage
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {category.name}
                            </h3>
                            {category.parent_name && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Sous-catégorie de : <span className="font-medium">{category.parent_name}</span>
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(category)}
                            >
                              Modifier
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setDeleteModal({ id: category.id, name: category.name })}
                              disabled={deleteCategoryMutation.isPending}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de confirmation de suppression */}
        <Modal
          isOpen={!!deleteModal}
          onClose={() => setDeleteModal(null)}
          onConfirm={handleDeleteConfirm}
          title="Supprimer la catégorie"
          description={`Êtes-vous sûr de vouloir supprimer la catégorie "${deleteModal?.name}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          loading={deleteCategoryMutation.isPending}
        />

        {/* ToastContainer */}
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} position="top-right" />
      </div>
    </Layout>
  )
}
