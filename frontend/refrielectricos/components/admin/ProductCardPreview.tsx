'use client';

import Image from 'next/image';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { ShoppingCart, Heart } from 'lucide-react';

interface ProductPreviewData {
  name: string;
  price: number;
  originalPrice?: number | null;
  promoLabel?: string | null;
  stock: number;
  image_url?: string | null;
  brand?: string | null;
  category?: string | null;
  subcategory?: string | null;
}

interface ProductCardPreviewProps {
  product: ProductPreviewData;
  /** Scale factor for the preview (0.5 = half size, 1 = full size) */
  scale?: number;
}

/**
 * A static preview of the ProductCard component for use in the admin editor.
 * This is a simplified version without interactivity (no cart, favorites, etc.)
 */
export default function ProductCardPreview({ product, scale = 0.8 }: ProductCardPreviewProps) {
  const isLowStock = product.stock > 0 && product.stock < 5;
  const isOutOfStock = product.stock === 0;
  
  // Discount calculation
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) 
    : 0;

  // Generate optimized URL for the card (thumbnail)
  const imageUrl = product.image_url ? getCloudinaryUrl(product.image_url, {
    width: 400,
    height: 400,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  }) : '';

  return (
    <div 
      className="transition-transform origin-top-left"
      style={{ transform: `scale(${scale})`, width: `${100 / scale}%` }}
    >
      <Card className="h-full flex flex-col overflow-hidden border-gray-200 dark:border-gray-700 max-w-[280px]">
        {/* Image */}
        <div className="relative w-full pt-[100%] bg-white overflow-hidden">
          <div className="absolute inset-0 p-4">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name || 'Product preview'}
                fill
                className="object-contain"
                sizes="280px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800">
                <span className="text-sm">Sin imagen</span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {isOutOfStock && (
              <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-md shadow-sm">
                Agotado
              </span>
            )}
            {!isOutOfStock && hasDiscount && (
              <span className="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-md shadow-sm">
                -{discountPercentage}%
              </span>
            )}
            {!isOutOfStock && product.promoLabel && (
              <span className="px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-md shadow-sm uppercase">
                {product.promoLabel}
              </span>
            )}
            {!isOutOfStock && isLowStock && (
              <span className="px-2 py-1 text-xs font-bold text-white bg-orange-500 rounded-md shadow-sm">
                Últimas unidades
              </span>
            )}
          </div>
          
          {/* Fake Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            <div className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-400">
              <Heart size={18} />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col grow">
          <div className="mb-2 min-h-[72px]">
            {/* Brand/Category */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate h-4">
              {product.brand && <span className="font-medium text-gray-700 dark:text-gray-300">{product.brand}</span>}
              {product.brand && (product.subcategory || product.category) && <span className="mx-1">•</span>}
              {product.subcategory || product.category || '\u00A0'}
            </p>
            <h3 
              className="text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 h-12 leading-tight" 
              title={product.name}
            >
              {product.name || 'Nombre del producto'}
            </h3>
          </div>
          
          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">Precio</span>
              <div className="flex flex-col">
                {hasDiscount && (
                  <span className="text-xs text-gray-400 line-through decoration-red-500/50">
                    {formatCurrency(Number(product.originalPrice))}
                  </span>
                )}
                <span className={`text-lg font-bold ${hasDiscount ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {formatCurrency(Number(product.price) || 0)}
                </span>
              </div>
            </div>
            
            <div 
              className={`shrink-0 w-10 h-10 p-0 rounded-full flex items-center justify-center text-white ${
                isOutOfStock
                  ? 'bg-gray-300 dark:bg-gray-700'
                  : 'bg-blue-600'
              }`}
            >
              <ShoppingCart size={18} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
