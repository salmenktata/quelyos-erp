import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { Layout } from '../components/Layout'
import { useOrder, useUpdateOrderStatus } from '../hooks/useOrders'
import { Badge, Button, Breadcrumbs, Skeleton, Modal } from '../components/common'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/common/Toast'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const orderId = parseInt(id || '0', 10)
  const { data, isLoading, error } = useOrder(orderId)
  const updateStatus = useUpdateOrderStatus()
  const toast = useToast()

  const [actionModal, setActionModal] = useState<{ action: 'confirm' | 'cancel' | 'done'; message: string } | null>(
    null
  )

  const handleUpdateStatusConfirm = async () => {
    if (!orderId || !actionModal) return

    try {
      await updateStatus.mutateAsync({ id: orderId, action: actionModal.action })
      toast.success('Statut mis à jour avec succès')
      setActionModal(null)
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const openActionModal = (action: 'confirm' | 'cancel' | 'done') => {
    const message =
      action === 'confirm'
        ? 'confirmer'
        : action === 'cancel'
        ? 'annuler'
        : 'marquer comme terminée'
    setActionModal({ action, message })
  }

  const getStatusVariant = (state: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    switch (state) {
      case 'sale':
      case 'done':
        return 'success'
      case 'sent':
        return 'info'
      case 'cancel':
        return 'error'
      case 'draft':
      default:
        return 'neutral'
    }
  }

  const getStatusLabel = (state: string) => {
    switch (state) {
      case 'draft':
        return 'Brouillon'
      case 'sent':
        return 'Envoyé'
      case 'sale':
        return 'Confirmé'
      case 'done':
        return 'Terminé'
      case 'cancel':
        return 'Annulé'
      default:
        return state
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8">
          <Breadcrumbs
            items={[
              { label: 'Tableau de bord', href: '/dashboard' },
              { label: 'Commandes', href: '/orders' },
              { label: 'Chargement...' },
            ]}
          />
          <div className="space-y-4 mt-8">
            <Skeleton variant="text" width="40%" height={36} />
            <Skeleton variant="text" width="60%" height={20} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <div className="lg:col-span-2">
                <Skeleton height={300} />
              </div>
              <div>
                <Skeleton height={200} />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !data?.data?.order) {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center text-red-600 dark:text-red-400">
            Erreur lors du chargement de la commande
          </div>
        </div>
      </Layout>
    )
  }

  const order = data.data.order

  return (
    <Layout>
      <div className="p-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Tableau de bord', href: '/dashboard' },
            { label: 'Commandes', href: '/orders' },
            { label: order.name },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Commande {order.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Passée le {formatDate(order.date_order)}</p>
            </div>

            <Badge variant={getStatusVariant(order.state)} size="lg">
              {getStatusLabel(order.state)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations client */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations client</h2>
              {order.customer ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nom</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Téléphone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.customer.phone || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Adresse</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.customer.street || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ville</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.customer.zip} {order.customer.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pays</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.customer.country || '-'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-500">Aucune information client</p>
              )}
            </div>

            {/* Lignes de commande */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Articles</h2>
              </div>

              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Prix unitaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                  {order.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {line.product.image && (
                            <img
                              src={line.product.image}
                              alt={line.product.name}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                            />
                          )}
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {line.product.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatPrice(line.price_unit)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{line.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(line.price_total)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Résumé et actions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Résumé</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatPrice(order.amount_untaxed)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">TVA</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatPrice(order.amount_tax)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {formatPrice(order.amount_total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>

              <div className="space-y-3">
                {order.state === 'draft' && (
                  <Button
                    variant="primary"
                    className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                    onClick={() => openActionModal('confirm')}
                    disabled={updateStatus.isPending}
                  >
                    Confirmer la commande
                  </Button>
                )}

                {(order.state === 'draft' || order.state === 'sent' || order.state === 'sale') && (
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => openActionModal('cancel')}
                    disabled={updateStatus.isPending}
                  >
                    Annuler la commande
                  </Button>
                )}

                {order.state === 'sale' && (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => openActionModal('done')}
                    disabled={updateStatus.isPending}
                  >
                    Marquer comme terminée
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de confirmation */}
        <Modal
          isOpen={!!actionModal}
          onClose={() => setActionModal(null)}
          onConfirm={handleUpdateStatusConfirm}
          title="Confirmer l'action"
          description={`Êtes-vous sûr de vouloir ${actionModal?.message} cette commande ?`}
          confirmText="Confirmer"
          cancelText="Annuler"
          variant={actionModal?.action === 'cancel' ? 'danger' : 'default'}
          loading={updateStatus.isPending}
        />

        {/* ToastContainer */}
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} position="top-right" />
      </div>
    </Layout>
  )
}
