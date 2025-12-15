'use client';

import { Heart, ShoppingCart, Check, Eye, Pencil } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuthStore } from '@/store/authStore';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import ProductQuickView from './ProductQuickView';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuthStore();
  
  const isAdmin = user?.role === 'ADMIN';
  const isFavorite = isInWishlist(product.id);
  const productLink = `/products/${product.slug || product.id}`;
  const isLowStock = product.stock > 0 && product.stock < 5;
  const isOutOfStock = product.stock === 0;
  
  // Discount calculation
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) 
    : 0;

  // Generate optimized URL for the card (thumbnail)
  const imageUrl = getCloudinaryUrl(product.image_url, {
    width: 400, // Slightly larger than 300 to look good on high DPI mobile
    height: 400,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) return;

    addItem(product);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <motion.div 
        className="group block h-full relative"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg border-gray-200 dark:border-gray-700">
          {/* Imagen */}
          <div className="relative w-full pt-[100%] bg-white overflow-hidden block group">
            <Link href={productLink} className="absolute inset-0 p-4">
              {product.image_url ? (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  priority={priority}
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <span>Sin imagen</span>
                </div>
              )}
            </Link>

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
            
            {/* Action Buttons Overlay */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 transition-all duration-300 translate-x-0 opacity-100 lg:translate-x-12 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100">
              {/* Admin Edit Button */}
              {isAdmin && (
                <Link
                  href={`/admin/products/${product.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-full bg-amber-500 shadow-md hover:bg-amber-600 text-white transition-colors"
                  title="Editar producto"
                >
                  <Pencil size={18} />
                </Link>
              )}
              <button
                onClick={handleToggleFavorite}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-gray-300 hover:text-red-500 transition-colors"
                title="Agregar a favoritos"
              >
                <Heart
                  size={18}
                  className={isFavorite ? 'fill-red-500 text-red-500' : ''}
                />
              </button>
              <button
                onClick={handleQuickView}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 dark:text-gray-300 hover:text-blue-600 transition-colors"
                title="Vista rápida"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-2 sm:p-4 flex flex-col grow">
            <div className="mb-2 min-h-[60px] sm:min-h-[72px]">
              {/* Brand/Category - fixed height line */}
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1 truncate h-3 sm:h-4">
                {product.brand && <span className="font-medium text-gray-700 dark:text-gray-300">{product.brand}</span>}
                {product.brand && (product.subcategory || product.category) && <span className="mx-1">•</span>}
                {product.subcategory || product.category || '\u00A0'}
              </p>
              <Link href={productLink}>
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 h-10 sm:h-12 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight" title={product.name}>
                  {product.name}
                </h3>
              </Link>
            </div>
            
            <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Precio</span>
                <div className="flex flex-col">
                  {hasDiscount && (
                    <span className="text-[10px] sm:text-xs text-gray-400 line-through decoration-red-500/50">
                      {formatCurrency(Number(product.originalPrice))}
                    </span>
                  )}
                  <span className={`text-sm sm:text-lg font-bold ${hasDiscount ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {formatCurrency(Number(product.price))}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handleAddToCart} 
                className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isAdded 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : isOutOfStock
                      ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-md hover:shadow-blue-500/20'
                }`}
                disabled={isAdded || isOutOfStock}
                title={isOutOfStock ? "Agotado" : "Agregar al carrito"}
              >
                <AnimatePresence mode='wait'>
                  {isAdded ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="cart"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <ProductQuickView 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
}
