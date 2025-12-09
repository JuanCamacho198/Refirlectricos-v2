'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart';
import Button from '@/components/ui/Button';
import { ShoppingCart, CreditCard, Check, ListPlus } from 'lucide-react';
import AddToWishlistModal from '@/components/features/wishlist/AddToWishlistModal';
import VariantSelector from '@/components/features/products/VariantSelector';
import { StarRating } from '@/components/features/reviews/StarRating';
import { Product, ProductVariant } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';

interface ProductInfoProps {
  product: Product;
  selectedVariant?: ProductVariant;
}

export default function ProductInfo({ product, selectedVariant }: ProductInfoProps) {
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

  // Use variant data if available, otherwise use product data
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayStock = selectedVariant?.stock ?? product.stock;

  // Discount calculation (only for base product)
  const hasDiscount = !selectedVariant && product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) 
    : 0;

  const handleAddToCart = () => {
    addItem(product, 1, selectedVariant);

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

      <div className="flex flex-col mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-3">
            <span className={`text-3xl font-bold ${hasDiscount ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {formatCurrency(Number(displayPrice))}
            </span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through decoration-gray-400">
                {formatCurrency(Number(product.originalPrice))}
              </span>
            )}
          </div>
          
          {displayStock > 0 ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
              Stock disponible: {displayStock}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
              Agotado
            </span>
          )}
        </div>
        
        <div className="flex gap-2 mt-2">
          {hasDiscount && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
              Ahorras {discountPercentage}%
            </span>
          )}
          {product.promoLabel && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 uppercase">
              {product.promoLabel}
            </span>
          )}
        </div>
      </div>

      {/* Variant Selector */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <VariantSelector
            variants={product.variants}
            currentVariantId={selectedVariant?.id}
          />
        </div>
      )}

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
            disabled={displayStock <= 0 || isAdded}
            className={`flex-1 gap-2 ${isAdded ? 'bg-green-600 hover:bg-green-700' : ''}`}
            size="lg"
          >
            {isAdded ? <Check size={20} /> : <ShoppingCart size={20} />}
            {isAdded ? 'Agregado' : 'Agregar al carrito'}
          </Button>

          <Button
            onClick={handleBuyNow}
            disabled={displayStock <= 0}
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
