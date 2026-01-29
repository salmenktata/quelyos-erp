/**
 * Page liste articles blog - SSR avec données initiales
 */

import { Suspense } from 'react';
import { backendClient, BlogPost, BlogCategory } from '@/lib/backend/client';
import Link from 'next/link';
import Image from 'next/image';
import { getProxiedImageUrl } from '@/lib/image-proxy';

export const revalidate = 60;

export const metadata = {
  title: 'Blog | Actualités et conseils',
  description: 'Découvrez nos articles, conseils et actualités',
};

interface SearchParams {
  category?: string;
  page?: string;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const limit = 12;
  const offset = (page - 1) * limit;

  const [postsResponse, categoriesResponse] = await Promise.all([
    backendClient.getBlogPosts({
      category_slug: params.category,
      limit,
      offset,
    }),
    backendClient.getBlogCategories(),
  ]);

  const posts = postsResponse.success ? postsResponse.posts : [];
  const total = postsResponse.total || 0;
  const categories = categoriesResponse.success ? categoriesResponse.categories : [];
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-white/80">Actualités, conseils et guides pratiques</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Catégories */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Catégories</h2>
              <nav className="space-y-2">
                <Link
                  href="/blog"
                  className={`block px-3 py-2 rounded-lg transition ${
                    !params.category
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Tous les articles
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/blog?category=${cat.slug}`}
                    className={`block px-3 py-2 rounded-lg transition ${
                      params.category === cat.slug
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat.name}
                    <span className="ml-2 text-sm text-gray-400">({cat.postCount})</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main - Articles */}
          <main className="flex-1">
            {posts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Aucun article pour le moment</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {page > 1 && (
                      <Link
                        href={`/blog?page=${page - 1}${params.category ? `&category=${params.category}` : ''}`}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Précédent
                      </Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={`/blog?page=${p}${params.category ? `&category=${params.category}` : ''}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                          p === page
                            ? 'bg-primary text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                    {page < totalPages && (
                      <Link
                        href={`/blog?page=${page + 1}${params.category ? `&category=${params.category}` : ''}`}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Suivant
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  const formattedDate = post.publishedDate
    ? new Date(post.publishedDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition group">
      <Link href={`/blog/${post.slug}`}>
        <div className="aspect-video relative bg-gray-100 dark:bg-gray-700">
          {post.coverUrl ? (
            <Image
              src={getProxiedImageUrl(post.coverUrl)}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}
          {post.isFeatured && (
            <span className="absolute top-3 left-3 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
              A la une
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <span className="text-primary font-medium">{post.categoryName}</span>
            <span>-</span>
            <span>{post.readingTime} min de lecture</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{post.authorName}</span>
            {formattedDate && <time>{formattedDate}</time>}
          </div>
        </div>
      </Link>
    </article>
  );
}
