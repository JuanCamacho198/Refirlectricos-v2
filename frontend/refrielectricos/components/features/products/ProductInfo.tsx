'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart';
import Button from '@/components/ui/Button';
import { ShoppingCart, CreditCard, Check, ListPlus } from 'lucide-react';
import AddToWishlistModal from '@/components/features/wishlist/AddToWishlistModal';
import { StarRating } from '@/components/features/reviews/StarRating';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', product.id],
    queryFn: async () => {
      const response = await api.get(`/reviews/product/${product.id}`);
      return response.data;
    },
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) / reviews.length
    : 0;

  const handleAddToCart = () => {
    addItem(product);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
      
      <div className="flex items-center gap-2 mb-4">
        <StarRating value={averageRating} readOnly size={20} />
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'opinión' : 'opiniones'})
        </span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {formatCurrency(Number(product.price))}
        </span>
        {product.stock > 0 ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
            Stock disponible: {product.stock}
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
            Agotado
          </span>
        )}
      </div>

      {/* Short Details */}
      <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
        {product.category && (
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 text-xs">Categoría</span>
            <span className="font-medium text-gray-900 dark:text-white">{product.category}</span>
          </div>
        )}
        {product.subcategory && (
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 text-xs">Subcategoría</span>
            <span className="font-medium text-gray-900 dark:text-white">{product.subcategory}</span>
          </div>
        )}
        {product.brand && (
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 text-xs">Marca</span>
            <span className="font-medium text-gray-900 dark:text-white">{product.brand}</span>
          </div>
        )}
        {product.sku && (
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 text-xs">SKU</span>
            <span className="font-mono text-gray-900 dark:text-white">{product.sku}</span>
          </div>
        )}
      </div>

      <div className="mt-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || isAdded}
            className={`flex-1 gap-2 ${isAdded ? 'bg-green-600 hover:bg-green-700' : ''}`}
            size="lg"
          >
            {isAdded ? <Check size={20} /> : <ShoppingCart size={20} />}
            {isAdded ? 'Agregado' : 'Agregar al carrito'}
          </Button>

          <Button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            variant="secondary"
            className="flex-1 gap-2"
            size="lg"
          >
            <CreditCard size={20} />
            Comprar ahora
          </Button>
        </div>
        
        <Button
          onClick={() => setIsWishlistModalOpen(true)}
          variant="outline"
          className="w-full gap-2"
        >
          <ListPlus size={20} />
          Agregar a una lista
        </Button>

        {/* Payment Methods */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">Métodos de pago aceptados</p>
          <div className="flex gap-3 opacity-60 grayscale hover:grayscale-0 transition-all">
            <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400">VISA</div>
            <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400">MC</div>
            <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400">PSE</div>
          </div>
        </div>
      </div>

      <AddToWishlistModal 
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        productId={product.id}
      />
    </div>
  );
}
