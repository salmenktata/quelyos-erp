import { useState, useCallback } from 'react'
import { Layout } from '../components/Layout'
import {
  useMenus,
  useCreateMenu,
  useUpdateMenu,
  useDeleteMenu,
  useReorderMenus,
  type MenuItem,
} from '../hooks/useMenus'
import { Badge, Button, Breadcrumbs, SkeletonTable, Modal } from '../components/common'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/common/Toast'

export default function Menus() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    label: '',
    url: '',
    icon: '',
    description: '',
    parent_id: null as number | null,
    active: true,
    open_new_tab: false,
    requires_auth: false,
    css_class: '',
  })

  const { data, isLoading, error } = useMenus()
  const createMutation = useCreateMenu()
  const updateMutation = useUpdateMenu()
  const deleteMutation = useDeleteMenu()
  const reorderMutation = useReorderMenus()
  const toast = useToast()

  const menus = (data?.data?.menus || []) as MenuItem[]

  const handleOpenModal = (menu?: MenuItem) => {
    if (menu) {
      setEditingMenu(menu)
      setFormData({
        name: menu.name,
        code: menu.code,
        label: menu.label,
        url: menu.url,
        icon: menu.icon || '',
        description: menu.description || '',
        parent_id: menu.parent_id || null,
        active: menu.active,
        open_new_tab: menu.open_new_tab,
        requires_auth: menu.requires_auth,
        css_class: menu.css_class || '',
      })
    } else {
      setEditingMenu(null)
      setFormData({
        name: '',
        code: '',
        label: '',
        url: '',
        icon: '',
        description: '',
        parent_id: null,
        active: true,
        open_new_tab: false,
        requires_auth: false,
        css_class: '',
      })
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingMenu(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingMenu) {
        await updateMutation.mutateAsync({ id: editingMenu.id, ...formData })
        toast.success('Menu mis à jour avec succès')
      } else {
        await createMutation.mutateAsync(formData)
        toast.success('Menu créé avec succès')
      }
      handleCloseModal()
    } catch {
      toast.error('Erreur lors de la sauvegarde du menu')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) return

    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Menu supprimé avec succès')
    } catch {
      toast.error('Erreur lors de la suppression du menu')
    }
  }

  const handleToggleActive = async (menu: MenuItem) => {
    try {
      await updateMutation.mutateAsync({ id: menu.id, active: !menu.active })
      toast.success(menu.active ? 'Menu désactivé' : 'Menu activé')
    } catch {
      toast.error('Erreur lors de la modification du menu')
    }
  }

  const handleDragStart = useCallback((e: React.DragEvent, menuId: number) => {
    setDraggedId(menuId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', menuId.toString())
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetId: number) => {
      e.preventDefault()

      if (draggedId === null || draggedId === targetId) {
        setDraggedId(null)
        return
      }

      const currentOrder = menus.map((m) => m.id)
      const draggedIndex = currentOrder.indexOf(draggedId)
      const targetIndex = currentOrder.indexOf(targetId)

      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedId(null)
        return
      }

      const newOrder = [...currentOrder]
      newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, draggedId)

      setDraggedId(null)

      try {
        await reorderMutation.mutateAsync(newOrder)
        toast.success('Ordre mis à jour')
      } catch {
        toast.error("Erreur lors de la mise à jour de l'ordre")
      }
    },
    [draggedId, menus, reorderMutation, toast]
  )

  const handleDragEnd = useCallback(() => {
    setDraggedId(null)
  }, [])

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'CMS', href: '#' },
              { label: 'Menus Navigation', href: '/menus' },
            ]}
          />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Menus Navigation</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez les menus du header et footer (3 menus racines)
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>Créer un Menu</Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-300">
            Une erreur est survenue lors du chargement des menus
          </div>
        )}

        {isLoading ? (
          <SkeletonTable rows={5} columns={6} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="w-16 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Ordre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Libellé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Sous-menus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {menus.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                      Aucun menu trouvé. Créez-en un pour commencer.
                    </td>
                  </tr>
                ) : (
                  menus.map((menu) => (
                    <tr
                      key={menu.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, menu.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, menu.id)}
                      onDragEnd={handleDragEnd}
                      className={`cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        draggedId === menu.id ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center">
                          <svg
                            className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 8h16M4 16h16"
                            />
                          </svg>
                          {menu.sequence}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">
                        {menu.code}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {menu.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {menu.icon && <span className="mr-2">{menu.icon}</span>}
                        {menu.label}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {menu.children_count ? (
                          <Badge variant="info">{menu.children_count} item(s)</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <Badge variant={menu.active ? 'success' : 'neutral'}>
                          {menu.active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleToggleActive(menu)}
                          className="mr-4 text-blue-600 hover:text-blue-900"
                        >
                          {menu.active ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          onClick={() => handleOpenModal(menu)}
                          className="mr-4 text-blue-600 hover:text-blue-900"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(menu.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingMenu ? 'Modifier le Menu' : 'Créer un Menu'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom interne *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Ex: Menu Principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Code unique *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Ex: header, footer_quick"
                  disabled={!!editingMenu}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {editingMenu ? 'Le code ne peut pas être modifié' : 'Identifiant technique (immutable)'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Libellé affiché *</label>
              <input
                type="text"
                required
                maxLength={100}
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Ex: Accueil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">URL *</label>
              <input
                type="text"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Ex: /products, /about, https://external.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Icône (optionnel)</label>
                <input
                  type="text"
                  maxLength={50}
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Ex: 🏠, home, fa-home"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Classes CSS custom</label>
                <input
                  type="text"
                  value={formData.css_class}
                  onChange={(e) => setFormData({ ...formData, css_class: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Ex: text-primary font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description (optionnel)</label>
              <textarea
                maxLength={250}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Tooltip ou sous-texte"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm text-gray-900">Actif</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.open_new_tab}
                  onChange={(e) => setFormData({ ...formData, open_new_tab: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm text-gray-900">Nouvel onglet</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requires_auth}
                  onChange={(e) => setFormData({ ...formData, requires_auth: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm text-gray-900">Requiert auth</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending
                  ? 'Enregistrement...'
                  : editingMenu
                  ? 'Mettre à jour'
                  : 'Créer'}
              </Button>
            </div>
          </form>
        </Modal>

        <ToastContainer />
      </div>
    </Layout>
  )
}
