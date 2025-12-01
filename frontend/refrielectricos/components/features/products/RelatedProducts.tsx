'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import ProductCard from './ProductCard';
import { Product } from '@/types/product';

interface RelatedProductsProps {
  category: string;
  currentProductId: string;
}

export default function RelatedProducts({ category, currentProductId }: RelatedProductsProps) {
  const { data: products, isLoading } = useQuery({
    queryKey: ['related-products', currentProductId],
    queryFn: async () => {
      const { data } = await api.get<Product[]>(`/products/${currentProductId}/recommendations`);
      return data;
    },
    enabled: !!currentProductId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        También te podría interesar
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
