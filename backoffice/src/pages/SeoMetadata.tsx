import { useState } from 'react'
import { Layout } from '../components/Layout'
import { useSeoMetadataList, useCreateSeoMetadata, useUpdateSeoMetadata, useDeleteSeoMetadata, SeoMetadata } from '../hooks/useSeoMetadata'
import { Button, Modal, SkeletonTable } from '../components/common'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/common/Toast'

export default function SeoMetadataPage() {
  const [editingMetadata, setEditingMetadata] = useState<SeoMetadata | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const { data: metadataList, isLoading } = useSeoMetadataList()
  const createMutation = useCreateSeoMetadata()
  const updateMutation = useUpdateSeoMetadata()
  const deleteMutation = useDeleteSeoMetadata()
  const toast = useToast()

  const [formData, setFormData] = useState<Partial<SeoMetadata>>({
    name: '',
    page_type: 'static',
    slug: '',
    meta_title: '',
    meta_description: '',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    schema_type: 'WebPage',
    noindex: false,
    nofollow: false,
    active: true,
  })

  const handleSave = async () => {
    try {
      if (isCreating) {
        await createMutation.mutateAsync(formData)
        toast.success('Metadata SEO créée')
      } else if (editingMetadata) {
        await updateMutation.mutateAsync({ id: editingMetadata.id, ...formData })
        toast.success('Metadata SEO mise à jour')
      }
      setIsCreating(false)
      setEditingMetadata(null)
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400'
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <Layout>
      <div className="p-6 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">SEO Metadata</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérer les balises meta pour le référencement</p>
          </div>
          <Button onClick={() => { setIsCreating(true); setFormData({ name: '', page_type: 'static', slug: '', meta_title: '', meta_description: '', og_type: 'website', twitter_card: 'summary_large_image', schema_type: 'WebPage', noindex: false, nofollow: false, active: true }) }}>Nouveau</Button>
        </div>

        {isLoading ? <SkeletonTable rows={5} columns={6} /> : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Score SEO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {metadataList?.map(m => (
                <tr key={m.id}>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">{m.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{m.page_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{m.meta_title}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-bold ${getScoreColor(m.seo_score)}`}>{m.seo_score || 0}/100</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded ${m.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`}>
                      {m.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <Button onClick={() => { setEditingMetadata(m); setFormData(m) }} size="sm">Éditer</Button>
                    <Button onClick={async () => { if (confirm('Supprimer cette metadata ?')) { await deleteMutation.mutateAsync(m.id); toast.success('Metadata supprimée') } }} size="sm" variant="secondary">Supprimer</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(isCreating || editingMetadata) && (
        <Modal isOpen={true} onClose={() => { setIsCreating(false); setEditingMetadata(null) }} title={isCreating ? 'Nouvelle metadata SEO' : 'Éditer metadata SEO'} size="xl">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom interne</label>
                <input type="text" placeholder="Ex: Homepage" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de page</label>
                <select value={formData.page_type} onChange={e => setFormData({ ...formData, page_type: e.target.value as any })} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100">
                  <option value="home">Homepage</option>
                  <option value="product">Page Produit</option>
                  <option value="category">Page Catégorie</option>
                  <option value="static">Page Statique</option>
                  <option value="collection">Collection</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug (URL)</label>
              <input type="text" placeholder="/about-us" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100 font-mono" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Doit commencer par / et contenir uniquement minuscules, chiffres et tirets</p>
            </div>

            <div className="border-t dark:border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Balises Meta</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Title <span className="text-xs text-gray-500">({(formData.meta_title || '').length}/60)</span>
                  </label>
                  <input type="text" maxLength={60} value={formData.meta_title} onChange={e => setFormData({ ...formData, meta_title: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Description <span className="text-xs text-gray-500">({(formData.meta_description || '').length}/160)</span>
                  </label>
                  <textarea maxLength={160} rows={3} value={formData.meta_description} onChange={e => setFormData({ ...formData, meta_description: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100" />
                </div>
              </div>
            </div>

            <div className="border-t dark:border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Open Graph (Réseaux sociaux)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OG Image URL</label>
                  <input type="url" placeholder="https://..." value={formData.og_image_url || ''} onChange={e => setFormData({ ...formData, og_image_url: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommandé : 1200x630px</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OG Type</label>
                    <select value={formData.og_type} onChange={e => setFormData({ ...formData, og_type: e.target.value as any })} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100">
                      <option value="website">Website</option>
                      <option value="article">Article</option>
                      <option value="product">Product</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Twitter Card</label>
                    <select value={formData.twitter_card} onChange={e => setFormData({ ...formData, twitter_card: e.target.value as any })} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100">
                      <option value="summary">Summary</option>
                      <option value="summary_large_image">Summary Large Image</option>
                      <option value="product">Product</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t dark:border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Avancé</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schema.org Type</label>
                  <select value={formData.schema_type} onChange={e => setFormData({ ...formData, schema_type: e.target.value as any })} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100">
                    <option value="WebPage">WebPage</option>
                    <option value="Product">Product</option>
                    <option value="Article">Article</option>
                    <option value="Organization">Organization</option>
                    <option value="FAQPage">FAQPage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Focus Keyword</label>
                  <input type="text" placeholder="mot-clé principal" value={formData.focus_keyword || ''} onChange={e => setFormData({ ...formData, focus_keyword: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100" />
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.noindex} onChange={e => setFormData({ ...formData, noindex: e.target.checked })} className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">NoIndex (masquer des moteurs)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.nofollow} onChange={e => setFormData({ ...formData, nofollow: e.target.checked })} className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">NoFollow</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t dark:border-gray-700">
            <Button onClick={() => { setIsCreating(false); setEditingMetadata(null) }} variant="secondary">Annuler</Button>
            <Button onClick={handleSave}>Sauvegarder</Button>
          </div>
        </Modal>
      )}

      <ToastContainer />
    </Layout>
  )
}
