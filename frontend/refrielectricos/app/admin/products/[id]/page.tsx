'use client';

import { useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { Loader2 } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: product, isLoading, isError } = useProduct(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !product) {
    return <div>Producto no encontrado</div>;
  }

  const initialData = {
    ...product,
    description: product.description || undefined,
    image_url: product.image_url || undefined,
    brand: product.brand || undefined,
    sku: product.sku || undefined,
    subcategory: product.subcategory || undefined,
    specifications: product.specifications || [],
    originalPrice: product.originalPrice ?? undefined,
    promoLabel: product.promoLabel || undefined,
  };

  return <ProductForm initialData={initialData} isEditing />;
}
