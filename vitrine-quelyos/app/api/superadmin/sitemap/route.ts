import { NextResponse } from 'next/server';
import { createApiLogger } from '@/lib/logger';
import sitemap from '@/app/sitemap';

const log = createApiLogger('GET /api/superadmin/sitemap');

/**
 * API Superadmin - Récupération des données du sitemap
 *
 * Endpoint pour le dashboard superadmin permettant de :
 * - Lister toutes les URLs du sitemap
 * - Obtenir des statistiques (total, priorités, fréquences)
 * - Analyser la distribution des pages
 */
export async function GET() {
  try {
    // Récupérer le sitemap généré
    const sitemapData = sitemap();

    // Transformer les données pour le frontend
    const entries = sitemapData.map(entry => {
      let lastModified: string;
      if (entry.lastModified) {
        lastModified = entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : new Date(entry.lastModified).toISOString();
      } else {
        lastModified = new Date().toISOString();
      }

      return {
        url: entry.url,
        path: entry.url.replace(process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000', ''),
        lastModified,
        changeFrequency: entry.changeFrequency || 'monthly',
        priority: entry.priority || 0.5,
      };
    });

    // Calculer les statistiques
    const stats = {
      total: entries.length,
      byPriority: entries.reduce((acc, entry) => {
        const key = entry.priority.toString();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byFrequency: entries.reduce((acc, entry) => {
        acc[entry.changeFrequency] = (acc[entry.changeFrequency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastUpdate: new Date().toISOString(),
    };

    return NextResponse.json({
      entries,
      stats,
      success: true,
    });

  } catch (error) {
    log.error('Erreur lors de la récupération du sitemap:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du sitemap',
      },
      { status: 500 }
    );
  }
}
