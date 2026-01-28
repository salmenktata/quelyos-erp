import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Palette, Tag } from 'lucide-react';
import { useModule } from '@/components/ModularLayout';

interface AttributeValue {
  id: number;
  name: string;
}

interface Attribute {
  id: number;
  name: string;
  displayType: string;
  createVariant: string;
  values: AttributeValue[];
}

export default function Attributes() {
  const { setTitle } = useModule();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Attribute | null>(null);
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    setTitle('Attributs Produits');
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const res = await fetch('/api/admin/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: {} }),
      });
      const data = await res.json();
      if (data.result?.success) {
        setAttributes(data.result.attributes);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAttribute = async () => {
    if (!editing) return;
    try {
      const res = await fetch('/api/admin/attributes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: editing }),
      });
      const data = await res.json();
      if (data.result?.success) {
        setEditing(null);
        fetchAttributes();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addValue = () => {
    if (!editing || !newValue.trim()) return;
    setEditing({
      ...editing,
      values: [...editing.values, { id: 0, name: newValue.trim() }],
    });
    setNewValue('');
  };

  const removeValue = (index: number) => {
    if (!editing) return;
    const newValues = [...editing.values];
    newValues.splice(index, 1);
    setEditing({ ...editing, values: newValues });
  };

  const newAttribute = () => {
    setEditing({
      id: 0,
      name: '',
      displayType: 'radio',
      createVariant: 'always',
      values: [],
    });
  };

  const getDisplayTypeLabel = (type: string) => {
    switch (type) {
      case 'radio': return 'Boutons radio';
      case 'select': return 'Liste déroulante';
      case 'color': return 'Nuancier couleurs';
      default: return type;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-500 dark:text-gray-400">
          Gérez les attributs pour créer des variantes produits
        </p>
        <button
          onClick={newAttribute}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nouvel attribut
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attributes.map((attr) => (
          <div
            key={attr.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {attr.displayType === 'color' ? (
                  <Palette className="w-5 h-5 text-purple-500" />
                ) : (
                  <Tag className="w-5 h-5 text-blue-500" />
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white">{attr.name}</h3>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditing(attr)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Edit className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {getDisplayTypeLabel(attr.displayType)}
            </p>

            <div className="flex flex-wrap gap-2">
              {attr.values.slice(0, 8).map((value) => (
                <span
                  key={value.id}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  {value.name}
                </span>
              ))}
              {attr.values.length > 8 && (
                <span className="px-2 py-1 text-xs text-gray-500">
                  +{attr.values.length - 8} autres
                </span>
              )}
            </div>
          </div>
        ))}

        {attributes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Tag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">Aucun attribut défini</p>
            <button
              onClick={newAttribute}
              className="mt-4 text-blue-600 hover:underline"
            >
              Créer un attribut
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editing.id ? 'Modifier l\'attribut' : 'Nouvel attribut'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Ex: Taille, Couleur, Matière..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type d'affichage
                </label>
                <select
                  value={editing.displayType}
                  onChange={(e) => setEditing({ ...editing, displayType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="radio">Boutons radio</option>
                  <option value="select">Liste déroulante</option>
                  <option value="color">Nuancier couleurs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Création de variantes
                </label>
                <select
                  value={editing.createVariant}
                  onChange={(e) => setEditing({ ...editing, createVariant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="always">Toujours créer des variantes</option>
                  <option value="dynamic">Variantes dynamiques</option>
                  <option value="no_variant">Jamais (attribut informatif)</option>
                </select>
              </div>

              {/* Values */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valeurs
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editing.values.map((value, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                    >
                      {value.name}
                      <button
                        onClick={() => removeValue(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addValue()}
                    placeholder="Ajouter une valeur..."
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={addValue}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Ajouter
                  </button>
                </div>
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
                onClick={saveAttribute}
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
