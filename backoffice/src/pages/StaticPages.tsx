import { useState } from 'react'
import { Layout } from '../components/Layout'
import { useStaticPages, useCreateStaticPage, useUpdateStaticPage, useDeleteStaticPage, StaticPage } from '../hooks/useStaticPages'
import { Button, Modal, SkeletonTable } from '../components/common'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/common/Toast'

export default function StaticPagesPage() {
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'content' | 'seo' | 'navigation'>('general')
  const { data: pages, isLoading } = useStaticPages()
  const createMutation = useCreateStaticPage()
  const updateMutation = useUpdateStaticPage()
  const deleteMutation = useDeleteStaticPage()
  const toast = useToast()

  const [formData, setFormData] = useState<Partial<StaticPage>>({
    name: '',
    slug: '',
    title: '',
    subtitle: '',
    content: '',
    layout: 'default',
    show_sidebar: false,
    sidebar_content: '',
    show_header_image: false,
    show_in_footer: false,
    show_in_menu: false,
    menu_position: 100,
    active: true,
  })

  const handleSave = async () => {
    try {
      if (isCreating) {
        await createMutation.mutateAsync(formData)
        toast.success('Page créée')
      } else if (editingPage) {
        await updateMutation.mutateAsync({ id: editingPage.id, ...formData })
        toast.success('Page mise à jour')
      }
      setIsCreating(false)
      setEditingPage(null)
      setActiveTab('general')
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return (
    <Layout>
      <div className="p-6 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pages Statiques</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérer les pages institutionnelles (À propos, CGV, etc.)</p>
          </div>
          <Button onClick={() => { setIsCreating(true); setFormData({ name: '', slug: '', title: '', subtitle: '', content: '', layout: 'default', show_sidebar: false, sidebar_content: '', show_header_image: false, show_in_footer: false, show_in_menu: false, menu_position: 100, active: true }); setActiveTab('general') }}>Nouvelle page</Button>
        </div>

        {isLoading ? <SkeletonTable rows={5} columns={6} /> : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Layout</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Footer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vues</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {pages?.map(p => (
                <tr key={p.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">{p.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{p.layout}</td>
                  <td className="px-6 py-4 text-sm">
                    {p.show_in_footer ? (
                      <span className="px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                        {p.footer_column || 'Oui'}
                      </span>
                    ) : (
                      <span className="text-gray-400">Non</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{p.views_count || 0}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <Button onClick={() => { setEditingPage(p); setFormData(p); setActiveTab('general') }} size="sm">Éditer</Button>
                    <Button onClick={async () => { if (confirm('Supprimer cette page ?')) { await deleteMutation.mutateAsync(p.id); toast.success('Page supprimée') } }} size="sm" variant="secondary">Supprimer</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(isCreating || editingPage) && (
        <Modal isOpen={true} onClose={() => { setIsCreating(false); setEditingPage(null); setActiveTab('general') }} title={isCreating ? 'Nouvelle page' : `Éditer ${editingPage?.name}`} size="xl">
          <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-4">
              <button onClick={() => setActiveTab('general')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'general' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400'}`}>Général</button>
              <button onClick={() => setActiveTab('content')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'content' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400'}`}>Contenu</button>
              <button onClick={() => setActiveTab('seo')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'seo' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400'}`}>SEO</button>
              <button onClick={() => setActiveTab('navigation')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'navigation' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400'}`}>Navigation</button>
            </nav>
          </div>

          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de la page</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => {
                    const name = e.target.value
                    setFormData({ ...formData, name, slug: generateSlug(name) })
                  }}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                  placeholder="À propos de nous"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug (URL)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100 font-mono"
                  placeholder="about-us"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">URL : /pages/{formData.slug}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titre</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sous-titre</label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mise en page</label>
                <select
                  value={formData.layout}
                  onChange={e => setFormData({ ...formData, layout: e.target.value as any })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="default">Par défaut (1 colonne)</option>
                  <option value="with_sidebar">Avec sidebar (2 colonnes)</option>
                  <option value="full_width">Pleine largeur</option>
                  <option value="narrow">Étroit (lecture)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contenu HTML</label>
                <textarea
                  rows={15}
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100 font-mono text-sm"
                  placeholder="<p>Votre contenu ici...</p>"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Utilisez du HTML pour formater votre contenu</p>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.show_header_image}
                    onChange={e => setFormData({ ...formData, show_header_image: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Afficher image en-tête</span>
                </label>
              </div>
              {formData.show_header_image && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL image en-tête</label>
                  <input
                    type="url"
                    value={formData.header_image_url || ''}
                    onChange={e => setFormData({ ...formData, header_image_url: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Title <span className="text-xs text-gray-500">({(formData.meta_title || '').length}/60)</span>
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={formData.meta_title || ''}
                  onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                  placeholder={formData.title || 'Titre de la page'}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Si vide, utilise le titre de la page</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Description <span className="text-xs text-gray-500">({(formData.meta_description || '').length}/160)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={160}
                  value={formData.meta_description || ''}
                  onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
          )}

          {activeTab === 'navigation' && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.show_in_footer}
                    onChange={e => setFormData({ ...formData, show_in_footer: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Afficher dans le footer</span>
                </label>
              </div>
              {formData.show_in_footer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Colonne footer</label>
                  <select
                    value={formData.footer_column || ''}
                    onChange={e => setFormData({ ...formData, footer_column: e.target.value as any })}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="company">Entreprise</option>
                    <option value="help">Aide</option>
                    <option value="legal">Légal</option>
                  </select>
                </div>
              )}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.show_in_menu}
                    onChange={e => setFormData({ ...formData, show_in_menu: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Afficher dans le menu principal</span>
                </label>
              </div>
              {formData.show_in_menu && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position dans le menu</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.menu_position}
                    onChange={e => setFormData({ ...formData, menu_position: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t dark:border-gray-700">
            <Button onClick={() => { setIsCreating(false); setEditingPage(null); setActiveTab('general') }} variant="secondary">Annuler</Button>
            <Button onClick={handleSave}>Sauvegarder</Button>
          </div>
        </Modal>
      )}

      <ToastContainer />
    </Layout>
  )
}
