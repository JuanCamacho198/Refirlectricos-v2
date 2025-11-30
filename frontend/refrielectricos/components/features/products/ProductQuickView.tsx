'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';

interface ProductQuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vista Rápida" className="max-w-3xl">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Sin imagen
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              {product.brand && <span className="font-medium">{product.brand}</span>}
              {product.brand && product.category && <span>•</span>}
              <span>{product.category}</span>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              {formatCurrency(Number(product.price))}
            </p>
            <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300 mb-6 line-clamp-4">
              {product.description || 'Sin descripción disponible.'}
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Disponibilidad:</span>
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                  En Stock ({product.stock})
                </span>
              ) : (
                <span className="text-red-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Agotado
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAdded}
                className={`w-full gap-2 ${isAdded ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                {isAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
                {isAdded ? 'Agregado' : 'Agregar al Carrito'}
              </Button>
              <Link href={`/products/${product.slug || product.id}`} className="w-full">
                <Button variant="outline" className="w-full gap-2" onClick={onClose}>
                  Ver Detalles <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
