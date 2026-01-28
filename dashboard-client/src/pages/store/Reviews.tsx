import { useState, useEffect } from 'react';
import { Star, Check, X, MessageSquare, Filter, Search } from 'lucide-react';
import { useModule } from '@/components/ModularLayout';

interface Review {
  id: number;
  title: string;
  productId: number;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  state: 'pending' | 'approved' | 'rejected';
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  sellerReply: string | null;
  createdAt: string;
}

export default function Reviews() {
  const { setTitle } = useModule();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    setTitle('Avis Clients');
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      const params: Record<string, string> = {};
      if (filter !== 'all') params.state = filter;

      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params }),
      });
      const data = await res.json();
      if (data.result?.success) {
        setReviews(data.result.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    const res = await fetch(`/api/admin/reviews/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: {} }),
    });
    const data = await res.json();
    if (data.result?.success) {
      fetchReviews();
    }
  };

  const handleReject = async (id: number) => {
    const res = await fetch(`/api/admin/reviews/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { reason: 'Non conforme' } }),
    });
    const data = await res.json();
    if (data.result?.success) {
      fetchReviews();
    }
  };

  const handleReply = async () => {
    if (!selectedReview || !replyText) return;
    const res = await fetch(`/api/admin/reviews/${selectedReview.id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { reply: replyText } }),
    });
    const data = await res.json();
    if (data.result?.success) {
      setSelectedReview(null);
      setReplyText('');
      fetchReviews();
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  const getStateColor = (state: string) => {
    switch (state) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const filteredReviews = reviews.filter(r =>
    r.productName.toLowerCase().includes(search.toLowerCase()) ||
    r.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.state === 'pending').length,
    approved: reviews.filter(r => r.state === 'approved').length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total avis</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Approuvés</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Note moyenne</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgRating} ⭐</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">Tous les avis</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvés</option>
          <option value="rejected">Rejetés</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {renderStars(review.rating)}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStateColor(review.state)}`}>
                    {review.state === 'pending' ? 'En attente' : review.state === 'approved' ? 'Approuvé' : 'Rejeté'}
                  </span>
                  {review.isVerifiedPurchase && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                      Achat vérifié
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">{review.title}</h3>
              </div>
              <div className="flex gap-2">
                {review.state === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                      title="Approuver"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReject(review.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      title="Rejeter"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedReview(review)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  title="Répondre"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{review.comment}</p>

            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>
                Par <strong>{review.customerName}</strong> sur <strong>{review.productName}</strong>
              </span>
              <span>{new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>

            {review.sellerReply && (
              <div className="mt-3 pl-4 border-l-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">Réponse vendeur:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{review.sellerReply}</p>
              </div>
            )}
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun avis trouvé
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Répondre à l'avis
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Avis de {selectedReview.customerName}:</p>
              <p className="text-gray-700 dark:text-gray-300">{selectedReview.comment}</p>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Votre réponse..."
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Annuler
              </button>
              <button
                onClick={handleReply}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
