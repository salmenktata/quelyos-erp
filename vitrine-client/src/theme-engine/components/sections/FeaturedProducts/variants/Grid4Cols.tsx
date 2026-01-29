'use client';

import type { ThemeContextValue } from '../../../../engine/types';

interface Grid4ColsProps {
  config?: Record<string, unknown>;
  className?: string;
  theme: ThemeContextValue;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  sku: string;
}

export default function Grid4Cols({ config, className = '', theme }: Grid4ColsProps) {
  const limit = (config?.limit as number) || 8;
  const sortBy = (config?.sortBy as string) || 'bestsellers';
  const title = (config?.title as string) || 'Nos Produits Phares';

  // TODO: Récupérer produits depuis backend Odoo
  // const products = await fetch(`/api/products?limit=${limit}&sort=${sortBy}`);

  // Mock data pour POC
  const products: Product[] = Array.from({ length: limit }, (_, i) => ({
    id: i + 1,
    name: `Produit ${i + 1}`,
    price: 99.99 + i * 10,
    image: `/images/products/product-${(i % 4) + 1}.jpg`,
    sku: `PROD-${i + 1}`,
  }));

  return (
    <section className={`py-16 md:py-24 bg-white dark:bg-gray-900 ${className}`}>
      <div
        className="container mx-auto px-4"
        style={{ maxWidth: theme.spacing.containerWidth }}
      >
        <h2
          className="text-3xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white"
          style={{ fontFamily: `var(--theme-font-headings)` }}
        >
          {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400?text=Product';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <p
                  className="text-xl font-bold"
                  style={{ color: theme.colors.primary }}
                >
                  {product.price.toFixed(2)} TND
                </p>
                <button
                  className="mt-4 w-full py-2 px-4 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: '#ffffff',
                  }}
                >
                  Ajouter au panier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
