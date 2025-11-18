'use client';

import { Heart, ShoppingCart, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
    // TODO: Integrar con AuthContext/Favorites
  };

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <Card className="h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative">
        {/* Imagen */}
        <div className="relative w-full pt-[70%] bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span>Sin imagen</span>
            )}
          </div>
          
          {/* Botón Favorito */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors z-10"
          >
            <Heart
              size={20}
              className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-gray-400'}
            />
          </button>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col grow text-center">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
          
          {product.category && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{product.category}</p>
          )}
          
          <div className="mt-auto">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
              ${Number(product.price).toLocaleString()}
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
    </Link>
  );
}
