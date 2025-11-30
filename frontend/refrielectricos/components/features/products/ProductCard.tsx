'use client';

import { Heart, ShoppingCart, Check, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import ProductQuickView from './ProductQuickView';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const isFavorite = isInWishlist(product.id);
  const productLink = `/products/${product.slug || product.id}`;
  const isLowStock = product.stock > 0 && product.stock < 5;
  const isOutOfStock = product.stock === 0;

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
          <div className="relative w-full pt-[80%] bg-gray-100 dark:bg-gray-800 overflow-hidden block group">
            <Link href={productLink} className="absolute inset-0">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
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
              {isLowStock && (
                <span className="px-2 py-1 text-xs font-bold text-white bg-orange-500 rounded-md shadow-sm">
                  Últimas unidades
                </span>
              )}
            </div>
            
            {/* Action Buttons Overlay */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
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
          <div className="p-4 flex flex-col grow">
            <div className="mb-2">
              {(product.category || product.brand) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                  {product.brand && <span className="font-medium text-gray-700 dark:text-gray-300">{product.brand}</span>}
                  {product.brand && product.category && <span className="mx-1">•</span>}
                  {product.category}
                </p>
              )}
              <Link href={productLink}>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={product.name}>
                  {product.name}
                </h3>
              </Link>
            </div>
            
            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">Precio</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(Number(product.price))}
                </span>
              </div>
              
              <Button 
                onClick={handleAddToCart} 
                className={`shrink-0 w-10 h-10 p-0 rounded-full flex items-center justify-center transition-all duration-300 ${
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
                      <Check size={18} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="cart"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <ShoppingCart size={18} />
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
