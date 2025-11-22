'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProductGallery from '@/components/features/products/ProductGallery';
import ProductInfo from '@/components/features/products/ProductInfo';
import ProductDescription from '@/components/features/products/ProductDescription';

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
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Nota: Aunque la carpeta se llama [id], ahora puede recibir un slug
  const term = params?.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!term) return;
      try {
        const response = await api.get(`/products/${term}`);
        const data = response.data;
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [term]);

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

  const images = product.images_url && product.images_url.length > 0 
    ? product.images_url 
    : (product.image_url ? [product.image_url] : []);

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
          <ProductGallery images={images} productName={product.name} />

          {/* Información del Producto */}
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Descripción y Detalles */}
      <ProductDescription description={product.description} tags={product.tags} />
    </>
  );
}
