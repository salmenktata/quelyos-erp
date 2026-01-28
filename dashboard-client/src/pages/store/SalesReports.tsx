import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Package, Calendar } from 'lucide-react';
import { useModule } from '@/components/ModularLayout';

interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topProducts: {
    id: number;
    name: string;
    quantity: number;
    revenue: number;
  }[];
}

export default function SalesReports() {
  const { setTitle } = useModule();
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    setTitle('Rapports de Ventes');
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: { date_from: dateRange.from, date_to: dateRange.to }
        }),
      });
      const data = await res.json();
      if (data.result?.success) {
        setReport(data.result.report);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Date Range */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <span className="text-gray-500">à</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const today = new Date();
              setDateRange({
                from: new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0],
                to: new Date().toISOString().split('T')[0],
              });
            }}
            className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            7 jours
          </button>
          <button
            onClick={() => {
              const today = new Date();
              setDateRange({
                from: new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0],
                to: new Date().toISOString().split('T')[0],
              });
            }}
            className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            30 jours
          </button>
          <button
            onClick={() => {
              const today = new Date();
              setDateRange({
                from: new Date(today.setMonth(today.getMonth() - 3)).toISOString().split('T')[0],
                to: new Date().toISOString().split('T')[0],
              });
            }}
            className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            3 mois
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {report?.totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} TND
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Commandes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {report?.totalOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Panier moyen</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {report?.avgOrderValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} TND
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Top 10 Produits
        </h3>
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
              <th className="pb-3">#</th>
              <th className="pb-3">Produit</th>
              <th className="pb-3 text-right">Quantité</th>
              <th className="pb-3 text-right">CA</th>
              <th className="pb-3 text-right">% du CA</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {report?.topProducts.map((product, index) => (
              <tr key={product.id} className="border-b border-gray-50 dark:border-gray-700/50">
                <td className="py-3 text-gray-400">{index + 1}</td>
                <td className="py-3 font-medium text-gray-900 dark:text-white">{product.name}</td>
                <td className="py-3 text-right text-gray-600 dark:text-gray-400">{product.quantity}</td>
                <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                  {product.revenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} TND
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${report.totalRevenue > 0 ? (product.revenue / report.totalRevenue) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-gray-500 w-12 text-right">
                      {report.totalRevenue > 0 ? ((product.revenue / report.totalRevenue) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {(!report?.topProducts || report.topProducts.length === 0) && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Aucune donnée pour cette période
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
