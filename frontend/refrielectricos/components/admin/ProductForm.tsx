'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, ArrowLeft, AlertTriangle, Trash2, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PriceInput from '@/components/ui/PriceInput';
import Modal from '@/components/ui/Modal';
import Combobox from '@/components/ui/Combobox';
import ImageUploadWithCrop from '@/components/ui/ImageUploadWithCrop';
import MultiImageUpload from '@/components/ui/MultiImageUpload';
import SpecificationsEditor from '@/components/admin/SpecificationsEditor';
import VariantsEditor from '@/components/admin/VariantsEditor';
import ProductCardPreview from '@/components/admin/ProductCardPreview';
import { productSchema, ProductFormData } from '@/schemas/product';
import { useToast } from '@/context/ToastContext';
import { useCreateProduct, useUpdateProduct, useProductMetadata } from '@/hooks/useProducts';
import { ProductVariant } from '@/types/product';

// Dynamic import for RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 min-h-40 animate-pulse" />
  ),
});

interface ProductFormProps {
  initialData?: ProductFormData & { id: string; variants?: ProductVariant[] };
  isEditing?: boolean;
}

const DRAFT_KEY = 'admin-product-draft';

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [error, setError] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState<ProductFormData | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>(initialData?.variants || []);
  const [showPreview, setShowPreview] = useState(true);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: metadata } = useProductMetadata();

  const isSaving = createProduct.isPending || updateProduct.isPending;

  // Load draft from localStorage if not editing
  const getInitialValues = () => {
    if (isEditing && initialData) return initialData;
    
    if (typeof window !== 'undefined') {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          return JSON.parse(draft);
        } catch (e) {
          console.error('Error parsing draft:', e);
        }
      }
    }

    return {
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      promoLabel: '',
      stock: 0,
      image_url: '',
      images_url: [],
      specifications: [],
      isActive: false, // Default: inactivo para evitar publicar productos incompletos
    };
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: getInitialValues(),
    mode: 'all', // Mostrar todos los errores simultáneamente
  });

  // Watch all fields to save draft
  const formValues = watch();

  useEffect(() => {
    if (!isEditing && isDirty) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formValues));
      }, 1000); // Debounce save
      return () => clearTimeout(timeoutId);
    }
  }, [formValues, isEditing, isDirty]);

  const selectedCategory = watch('category');
  const subcategories = metadata?.structure.find(s => s.name === selectedCategory)?.subcategories || [];

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    setPendingData(data);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingData) return;
    
    setIsConfirmModalOpen(false);
    setError('');

    const payload = {
      ...pendingData,
      price: Number(pendingData.price),
      originalPrice: pendingData.originalPrice ? Number(pendingData.originalPrice) : undefined,
      stock: Number(pendingData.stock),
      image_url: pendingData.image_url || undefined,
      images_url: pendingData.images_url || undefined,
      description: pendingData.description || undefined,
      specifications: pendingData.specifications?.filter(s => s.label && s.value) || undefined,
    };

    try {
      if (isEditing && initialData) {
        await updateProduct.mutateAsync({ id: initialData.id, ...payload });
        addToast('Producto actualizado correctamente', 'success');
      } else {
        await createProduct.mutateAsync(payload);
        addToast('Producto creado correctamente', 'success');
        // Clear draft on success
        localStorage.removeItem(DRAFT_KEY);
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err: unknown) {
      console.error('Error saving product:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      const errorMessage = error.response?.data?.message || 'Error al guardar el producto';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setPendingData(null);
    }
  };

  const clearDraft = () => {
    if (confirm('¿Estás seguro de borrar el borrador?')) {
      localStorage.removeItem(DRAFT_KEY);
      reset({
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        promoLabel: '',
        stock: 0,
        image_url: '',
        images_url: [],
        specifications: [],
        isActive: false, // Default: inactivo
      });
      addToast('Borrador eliminado', 'info');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <Link href="/admin/products" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-2">
            <ArrowLeft size={16} />
            Volver a productos
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={() => setShowPreview(!showPreview)}
            className="text-gray-600 dark:text-gray-400"
          >
            {showPreview ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
            {showPreview ? 'Ocultar preview' : 'Ver preview'}
          </Button>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={clearDraft} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 size={16} className="mr-1" />
              Limpiar borrador
            </Button>
          )}
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-[1fr,320px]' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}

        <Input
          label="Nombre del Producto"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Ej: Nevera Samsung 300L"
          required
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Descripción
              </label>
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Detalles del producto..."
                disabled={isSaving}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <PriceInput
                label="Precio Actual"
                value={field.value}
                onChange={field.onChange}
                error={errors.price?.message}
                placeholder="0"
                disabled={isSaving}
                required
              />
            )}
          />
          <Controller
            name="originalPrice"
            control={control}
            render={({ field }) => (
              <PriceInput
                label="Precio Original (Antes)"
                value={field.value || 0}
                onChange={field.onChange}
                error={errors.originalPrice?.message}
                placeholder="0 (Opcional)"
                disabled={isSaving}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Etiqueta de Promoción"
            {...register('promoLabel')}
            error={errors.promoLabel?.message}
            placeholder="Ej: Oferta, Black Friday"
          />
          <Input
            label="Stock"
            type="number"
            {...register('stock')}
            error={errors.stock?.message}
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <Combobox
                  options={metadata?.categories || []}
                  value={field.value || ''}
                  onChange={(val) => {
                    field.onChange(val);
                    setValue('subcategory', '');
                  }}
                  creatable
                  placeholder="Seleccionar categoría"
                  searchPlaceholder="Buscar categoría..."
                />
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="subcategory"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Subcategoría
                </label>
                <Combobox
                  options={subcategories}
                  value={field.value || ''}
                  onChange={field.onChange}
                  creatable
                  placeholder="Seleccionar subcategoría"
                  searchPlaceholder="Buscar subcategoría..."
                  disabled={!selectedCategory}
                />
                {errors.subcategory && (
                  <p className="mt-1 text-sm text-red-500">{errors.subcategory.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Marca
                </label>
                <Combobox
                  options={metadata?.brands || []}
                  value={field.value || ''}
                  onChange={field.onChange}
                  creatable
                  placeholder="Seleccionar marca"
                  searchPlaceholder="Buscar marca..."
                />
                {errors.brand && (
                  <p className="mt-1 text-sm text-red-500">{errors.brand.message}</p>
                )}
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="SKU"
            {...register('sku')}
            error={errors.sku?.message}
            placeholder="Ej: REF-123"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Etiquetas (separadas por coma)
            </label>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-white dark:bg-gray-800 sm:text-sm sm:leading-6 px-3 transition-all"
              placeholder="Ej: inverter, original, nuevo"
              {...register('tags', {
                setValueAs: (v) => typeof v === 'string' ? v.split(',').map(t => t.trim()).filter(Boolean) : v
              })}
            />
            {errors.tags && <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>}
          </div>
        </div>

        {/* Specifications Editor */}
        <Controller
          name="specifications"
          control={control}
          render={({ field }) => (
            <SpecificationsEditor
              value={field.value || []}
              onChange={field.onChange}
              disabled={isSaving}
            />
          )}
        />

        {/* Variants Editor - Solo visible al editar */}
        {isEditing && initialData?.id && (
          <VariantsEditor
            productId={initialData.id}
            productData={{
              name: initialData.name,
              sku: initialData.sku,
              price: initialData.price,
              originalPrice: initialData.originalPrice,
              stock: initialData.stock,
            }}
            variants={variants}
            onVariantsChange={setVariants}
            disabled={isSaving}
          />
        )}

        <Controller
          name="image_url"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Imagen Principal <span className="text-red-500">*</span>
              </label>
              <ImageUploadWithCrop
                value={field.value || ''}
                onChange={field.onChange}
                disabled={isSaving}
                showCropButton={true}
              />
              {errors.image_url && (
                <p className="text-sm text-red-500">{errors.image_url.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          name="images_url"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Galería de Imágenes
              </label>
              <MultiImageUpload
                value={field.value || []}
                onChange={field.onChange}
                disabled={isSaving}
              />
              {errors.images_url && (
                <p className="text-sm text-red-500">{errors.images_url.message}</p>
              )}
            </div>
          )}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Producto Activo (Visible en la tienda)
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Live Preview Panel */}
      {showPreview && (
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Eye size={16} />
                Vista previa de la tarjeta
              </h3>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center min-h-[380px]">
                <ProductCardPreview 
                  product={{
                    name: formValues.name || '',
                    price: Number(formValues.price) || 0,
                    originalPrice: formValues.originalPrice ? Number(formValues.originalPrice) : null,
                    promoLabel: formValues.promoLabel || null,
                    stock: Number(formValues.stock) || 0,
                    image_url: formValues.image_url || null,
                    brand: formValues.brand || null,
                    category: formValues.category || null,
                    subcategory: formValues.subcategory || null,
                  }}
                  scale={0.85}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Así se verá en la tienda
              </p>
            </div>
          </div>
        </div>
      )}
      </div>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirmar cambios"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <p className="text-sm font-medium">
              ¿Estás seguro de que deseas {isEditing ? 'actualizar' : 'crear'} este producto?
            </p>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Esta acción guardará los cambios en la base de datos y será visible para los usuarios inmediatamente.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
