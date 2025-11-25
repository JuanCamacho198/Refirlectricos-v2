'use client';

import { Heart, ShoppingCart, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const isFavorite = isInWishlist(product.id);
  const productLink = `/products/${product.slug || product.id}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    addItem(product);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    await toggleWishlist(product.id);
  };

  return (
    <div className="group block h-full relative">
      <Card className="h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative">
        {/* Imagen */}
        <Link href={productLink} className="relative w-full pt-[70%] bg-gray-100 dark:bg-gray-700 overflow-hidden block">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <span>Sin imagen</span>
            )}
          </div>
        </Link>
          
        {/* Botón Favorito */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors z-10 cursor-pointer"
        >
          <Heart
            size={20}
            className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-gray-400'}
          />
        </button>

        {/* Info */}
        <div className="p-4 flex flex-col grow text-center">
          <Link href={productLink}>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {product.name}
            </h3>
          </Link>
          
          {(product.category || product.brand) && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {product.brand && <span className="font-medium text-gray-700 dark:text-gray-300">{product.brand}</span>}
              {product.brand && product.category && <span className="mx-1">•</span>}
              {product.category}
            </p>
          )}
          
          <div className="mt-auto">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
              {formatCurrency(Number(product.price))}
            </p>
            
            <Button 
              onClick={handleAddToCart} 
              className={`w-full gap-2 transition-all ${isAdded ? 'bg-green-600 hover:bg-green-700' : ''}`}
              size="sm"
              disabled={isAdded}
            >
              {isAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
              {isAdded ? 'Agregado' : 'Agregar'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
