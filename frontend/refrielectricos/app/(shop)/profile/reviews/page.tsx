'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { reviewsService, Review, PendingProduct } from '@/lib/reviews';
import Button from '@/components/ui/Button';
import { Star, MessageSquare, Package } from 'lucide-react';
import { clsx } from 'clsx';

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pending, history] = await Promise.all([
        reviewsService.getPendingReviews(),
        reviewsService.getMyReviews(),
      ]);
      setPendingProducts(pending);
      setMyReviews(history);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Star className="w-8 h-8 text-yellow-500" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Reseñas</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
        <button
          onClick={() => setActiveTab('pending')}
          className={clsx(
            'px-6 py-3 font-medium text-sm transition-colors relative',
            activeTab === 'pending'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          Pendientes por calificar
          {pendingProducts.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
              {pendingProducts.length}
            </span>
          )}
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={clsx(
            'px-6 py-3 font-medium text-sm transition-colors relative',
            activeTab === 'history'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          Historial de reseñas
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'pending' ? (
            pendingProducts.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No tienes productos pendientes por calificar.
                </p>
                <Link href="/products">
                  <Button>Seguir comprando</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-6 items-center"
                  >
                    <div className="relative w-24 h-24 shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <Link href={`/products/${product.slug || product.id}#reviews`}>
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">
                          Escribir Reseña
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // History Tab
            myReviews.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Aún no has escrito ninguna reseña.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex gap-6">
                      {review.product && (
                        <Link
                          href={`/products/${review.product.slug || review.product.id}`}
                          className="shrink-0 relative w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                        >
                          {review.product.image_url ? (
                            <Image
                              src={review.product.image_url}
                              alt={review.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : null}
                        </Link>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {review.product?.name || 'Producto eliminado'}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={clsx(
                                'w-4 h-4',
                                star <= review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
