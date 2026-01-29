'use client';

import { useEffect, useState, useCallback } from 'react';
import { backendClient, FlashSale } from '@/lib/backend/client';
import Link from 'next/link';
import Image from 'next/image';
import { getProxiedImageUrl } from '@/lib/image-proxy';

export function FlashSalesSection() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSales = async () => {
      const response = await backendClient.getFlashSales();
      if (response.success && response.flashSales.length > 0) {
        setFlashSales(response.flashSales);
      }
      setIsLoading(false);
    };
    fetchFlashSales();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-r from-red-600 to-orange-500">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse flex items-center gap-4">
              <div className="w-8 h-8 bg-white/20 rounded" />
              <div className="h-6 bg-white/20 rounded w-48" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (flashSales.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gradient-to-r from-red-600 to-orange-500 relative overflow-hidden">
      {/* Effet décoratif */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {flashSales.map((sale) => (
          <FlashSaleCard key={sale.id} sale={sale} />
        ))}
      </div>
    </section>
  );
}

function FlashSaleCard({ sale }: { sale: FlashSale }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(sale.endDate));

  const updateTime = useCallback(() => {
    setTimeLeft(calculateTimeLeft(sale.endDate));
  }, [sale.endDate]);

  useEffect(() => {
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [updateTime]);

  const isExpired = !timeLeft.days && !timeLeft.hours && !timeLeft.minutes && !timeLeft.seconds;

  if (isExpired) return null;

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8">
      {/* Info vente flash */}
      <div className="flex-shrink-0 text-center lg:text-left">
        <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
          <span className="animate-pulse">
            <svg className="w-8 h-8 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </span>
          <h2 className="text-2xl font-bold text-white">VENTE FLASH</h2>
        </div>
        <p className="text-white/90 text-lg mb-4">{sale.name}</p>

        {/* Countdown */}
        <div className="flex justify-center lg:justify-start gap-3">
          <TimeBlock value={timeLeft.days} label="Jours" />
          <TimeBlock value={timeLeft.hours} label="Heures" />
          <TimeBlock value={timeLeft.minutes} label="Min" />
          <TimeBlock value={timeLeft.seconds} label="Sec" />
        </div>
      </div>

      {/* Produits en promo */}
      <div className="flex-1 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="flex gap-4 min-w-max">
          {sale.products.slice(0, 6).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="flex-shrink-0 w-36 bg-white rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform"
            >
              <div className="aspect-square relative bg-gray-100">
                {product.image_url ? (
                  <Image
                    src={getProxiedImageUrl(product.image_url)}
                    alt={product.name}
                    fill
                    sizes="144px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {product.compare_at_price && product.price && product.compare_at_price > product.price && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-red-600">{(product.price ?? 0).toFixed(2)}€</span>
                  {product.compare_at_price && product.price && product.compare_at_price > product.price && (
                    <span className="text-xs text-gray-400 line-through">
                      {product.compare_at_price.toFixed(2)}€
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/products?flash_sale=true"
        className="flex-shrink-0 bg-white text-red-600 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition shadow-lg"
      >
        Voir tout
      </Link>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px] text-center">
      <span className="text-2xl font-bold text-white block">{String(value).padStart(2, '0')}</span>
      <span className="text-xs text-white/80 uppercase">{label}</span>
    </div>
  );
}

function calculateTimeLeft(endDate: string) {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}
