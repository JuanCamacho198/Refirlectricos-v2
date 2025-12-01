'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProductGallery from '@/components/features/products/ProductGallery';
import ProductInfo from '@/components/features/products/ProductInfo';
import ProductDescription from '@/components/features/products/ProductDescription';
import ProductDetailSkeleton from '@/components/features/products/ProductDetailSkeleton';
import { useProduct } from '@/hooks/useProducts';

const ProductReviews = dynamic(() => import('@/components/features/reviews/ProductReviews').then(mod => mod.ProductReviews), {
  loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />,
});

const RelatedProducts = dynamic(() => import('@/components/features/products/RelatedProducts'), {
  loading: () => <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />,
});

export default function ProductDetailClient() {
  const params = useParams();
  
  // Nota: Aunque la carpeta se llama [id], ahora puede recibir un slug
  const term = params?.id as string;

  const { data: product, isLoading: loading, isError } = useProduct(term);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Producto no encontrado</h1>
        <Link href="/">
          <Button variant="outline">Volver a la tienda</Button>
        </Link>
      </div>
    );
  }

  const additionalImages = product.images_url?.filter(url => url && url.trim() !== '') || [];
  // Combinamos la imagen principal con las adicionales, asegurando que la principal vaya primero
  const images = product.image_url 
    ? [product.image_url, ...additionalImages.filter(url => url !== product.image_url)]
    : (additionalImages.length > 0 ? additionalImages : []);

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
      <ProductDescription description={product.description || ''} tags={product.tags} />

      {/* Productos Relacionados */}
      {product.category && (
        <RelatedProducts category={product.category} currentProductId={product.id} />
      )}

      {/* Reseñas */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 transition-colors">
        <ProductReviews productId={product.id} />
      </div>
    </>
  );
}
