import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Quote, Star, User } from 'lucide-react';
import { useModule } from '@/components/ModularLayout';

interface Testimonial {
  id: number;
  customerName: string;
  customerTitle: string;
  customerCompany: string;
  avatarUrl: string | null;
  content: string;
  rating: number;
  isPublished: boolean;
  isFeatured: boolean;
  displayOn: string;
}

export default function Testimonials() {
  const { setTitle } = useModule();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  useEffect(() => {
    setTitle('Témoignages');
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: {} }),
      });
      const data = await res.json();
      if (data.result?.success) {
        setTestimonials(data.result.testimonials);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTestimonial = async () => {
    if (!editing) return;
    try {
      const res = await fetch('/api/admin/testimonials/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: editing }),
      });
      const data = await res.json();
      if (data.result?.success) {
        setEditing(null);
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const newTestimonial = () => {
    setEditing({
      id: 0,
      customerName: '',
      customerTitle: '',
      customerCompany: '',
      avatarUrl: null,
      content: '',
      rating: 5,
      isPublished: false,
      isFeatured: false,
      displayOn: 'homepage',
    });
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

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-500 dark:text-gray-400">
          Affichez les témoignages de vos clients satisfaits
        </p>
        <button
          onClick={newTestimonial}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nouveau témoignage
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <Quote className="w-8 h-8 text-blue-500/20 mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
              "{testimonial.content}"
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {testimonial.avatarUrl ? (
                    <img src={testimonial.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{testimonial.customerName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.customerTitle}
                    {testimonial.customerCompany && ` - ${testimonial.customerCompany}`}
                  </p>
                </div>
              </div>
              {renderStars(testimonial.rating)}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex gap-2">
                {testimonial.isPublished ? (
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
                    Publié
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                    Brouillon
                  </span>
                )}
                {testimonial.isFeatured && (
                  <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
                    Mis en avant
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditing(testimonial)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Edit className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {testimonials.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Quote className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">Aucun témoignage</p>
            <button
              onClick={newTestimonial}
              className="mt-4 text-blue-600 hover:underline"
            >
              Ajouter un témoignage
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editing.id ? 'Modifier le témoignage' : 'Nouveau témoignage'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du client
                </label>
                <input
                  type="text"
                  value={editing.customerName}
                  onChange={(e) => setEditing({ ...editing, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Titre/Fonction
                  </label>
                  <input
                    type="text"
                    value={editing.customerTitle}
                    onChange={(e) => setEditing({ ...editing, customerTitle: e.target.value })}
                    placeholder="Ex: CEO"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    value={editing.customerCompany}
                    onChange={(e) => setEditing({ ...editing, customerCompany: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Témoignage
                </label>
                <textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Note
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditing({ ...editing, rating: star })}
                    >
                      <Star
                        className={`w-6 h-6 ${star <= editing.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Afficher sur
                </label>
                <select
                  value={editing.displayOn}
                  onChange={(e) => setEditing({ ...editing, displayOn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="homepage">Page d'accueil</option>
                  <option value="product">Pages produit</option>
                  <option value="checkout">Checkout</option>
                  <option value="all">Partout</option>
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.isPublished}
                    onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Publié</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.isFeatured}
                    onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mise en avant</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Annuler
              </button>
              <button
                onClick={saveTestimonial}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
