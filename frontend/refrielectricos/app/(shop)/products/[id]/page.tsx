'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';
import { ShoppingCart, CreditCard, Check, Heart, ListPlus, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import AddToWishlistModal from '@/components/features/wishlist/AddToWishlistModal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
  images_url?: string[]; // Soporte para múltiples imágenes si el backend lo envía
  category?: string;
  brand?: string;
  sku?: string;
  tags?: string[];
  main_category?: string;
  sub_category?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const zoomRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

  const id = params?.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/products/${id}`);
        const data = response.data;
        setProduct(data);
        // Establecer imagen principal (prioridad: array[0] -> string -> placeholder)
        const initialImage = data.images_url?.[0] || data.image_url || '';
        setMainImage(initialImage);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomRef.current || !containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    
    zoomRef.current.style.transformOrigin = `${x}% ${y}%`;
    zoomRef.current.style.transform = "scale(2)";
  };

  const handleMouseLeave = () => {
    if (!zoomRef.current) return;
    zoomRef.current.style.transformOrigin = "center center";
    zoomRef.current.style.transform = "scale(1)";
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Producto no encontrado</h1>
        <Link href="/">
          <Button variant="outline">Volver a la tienda</Button>
        </Link>
      </div>
    );
  }

  const images = product.images_url || (product.image_url ? [product.image_url] : []);

  return (
    <>
      <Breadcrumbs 
        items={[
          { label: 'Productos', href: '/products' },
          { label: product.name }
        ]}
        className="mb-8"
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Galería de Imágenes */}
          <div className="space-y-4">
            <div 
              ref={containerRef}
              className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-zoom-in border border-gray-200 dark:border-gray-600"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {mainImage ? (
                <Image
                  ref={zoomRef}
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform duration-200 ease-out"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  Sin imagen
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(img)}
                    className={`relative w-20 h-20 shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                      mainImage === img ? 'border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Vista ${index + 1}`}
                      fill
                      className="object-contain bg-white dark:bg-gray-700"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ${Number(product.price).toLocaleString()}
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

            <div className="prose prose-sm text-gray-600 dark:text-gray-300 mb-8">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Descripción</h3>
              <p>{product.description || 'Sin descripción disponible.'}</p>
            </div>

            {/* Detalles adicionales: Categoría, Marca, SKU, Tags */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
              {product.category && (
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Categoría</span>
                  <span className="font-medium text-gray-900 dark:text-white">{product.category}</span>
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

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {product.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    <Tag size={12} className="mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

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

              {/* Métodos de pago (Simulados) */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">Métodos de pago aceptados</p>
                <div className="flex gap-3 opacity-60 grayscale hover:grayscale-0 transition-all">
                  <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400">VISA</div>
                  <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400">MC</div>
                  <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400">PSE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddToWishlistModal 
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        productId={product.id}
      />
    </>
  );
}
