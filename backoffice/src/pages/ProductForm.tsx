import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useProduct, useCreateProduct, useUpdateProduct } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'

export default function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const { data: productData, isLoading: isLoadingProduct } = useProduct(Number(id))
  const { data: categoriesData } = useCategories()
  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category_id: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = categoriesData?.data?.categories || []

  // Charger les données du produit en mode édition
  useEffect(() => {
    if (isEditing && productData?.data?.product) {
      const product = productData.data.product
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        description: product.description || '',
        category_id: product.category?.id?.toString() || '',
      })
    }
  }, [isEditing, productData])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire'
    }

    if (!formData.price) {
      newErrors.price = 'Le prix est obligatoire'
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = 'Le prix doit être un nombre positif'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const data = {
      name: formData.name,
      price: Number(formData.price),
      description: formData.description || undefined,
      category_id: formData.category_id ? Number(formData.category_id) : undefined,
    }

    try {
      if (isEditing) {
        await updateProductMutation.mutateAsync({ id: Number(id), data })
      } else {
        await createProductMutation.mutateAsync(data)
      }
      navigate('/products')
    } catch (error) {
      console.error('Error saving product:', error)
      alert(`Erreur lors de ${isEditing ? 'la modification' : 'la création'} du produit`)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  if (isEditing && isLoadingProduct) {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 dark:text-gray-400">Chargement du produit...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white">
            {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 mt-2">
            {isEditing ? 'Modifier les informations du produit' : 'Créer un nouveau produit dans le catalogue'}
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">
                Nom du produit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none`}
                placeholder="Ex: T-shirt Nike Air"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Prix */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">
                Prix (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border ${
                  errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none`}
                placeholder="49.99"
              />
              {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>

            {/* Catégorie */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">
                Catégorie
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none"
              >
                <option value="">Sans catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none"
                placeholder="Description du produit..."
              />
            </div>

            {/* Image (placeholder pour le moment) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">
                Image du produit
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg p-6 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400">
                  Upload d'images disponible prochainement
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
                className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {(createProductMutation.isPending || updateProductMutation.isPending) && (
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                )}
                {isEditing ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
