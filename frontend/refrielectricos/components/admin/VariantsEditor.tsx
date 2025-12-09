'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, GripVertical, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PriceInput from '@/components/ui/PriceInput';
import ImageUpload from '@/components/ui/ImageUpload';
import Modal from '@/components/ui/Modal';
import { ProductVariant } from '@/types/product';
import { useToast } from '@/context/ToastContext';
import {
  useProductVariants,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
} from '@/hooks/useProducts';

interface VariantFormData {
  id?: string;
  name: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image_url?: string;
  attributes: Record<string, string>;
  isDefault: boolean;
  isActive: boolean;
}

interface VariantsEditorProps {
  productId: string;
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  disabled?: boolean;
}

const COMMON_ATTRIBUTES = [
  { key: 'potencia', label: 'Potencia', examples: ['1/4 HP', '1/3 HP', '1/2 HP', '1 HP'] },
  { key: 'voltaje', label: 'Voltaje', examples: ['110V', '220V', '110V/220V'] },
  { key: 'capacidad', label: 'Capacidad', examples: ['12000 BTU', '18000 BTU', '24000 BTU'] },
  { key: 'tamaño', label: 'Tamaño', examples: ['Pequeño', 'Mediano', 'Grande'] },
  { key: 'color', label: 'Color', examples: ['Blanco', 'Negro', 'Gris', 'Acero Inoxidable'] },
];

export default function VariantsEditor({
  productId,
  variants: initialVariants,
  onVariantsChange,
  disabled = false,
}: VariantsEditorProps) {
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<VariantFormData>({
    name: '',
    price: 0,
    stock: 0,
    attributes: {},
    isDefault: false,
    isActive: true,
  });

  // Fetch variants from server
  const { data: serverVariants, isLoading } = useProductVariants(productId);
  const createVariant = useCreateVariant();
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();

  // Use server variants if available, otherwise use initial
  const variants = serverVariants || initialVariants;

  // Sync variants to parent when server data changes
  useEffect(() => {
    if (serverVariants) {
      onVariantsChange(serverVariants);
    }
  }, [serverVariants, onVariantsChange]);

  const isSaving = createVariant.isPending || updateVariant.isPending || deleteVariant.isPending;

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      stock: 0,
      attributes: {},
      isDefault: variants.length === 0, // First variant is default
      isActive: true,
    });
    setEditingIndex(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (index: number) => {
    const variant = variants[index];
    setFormData({
      id: variant.id,
      name: variant.name,
      sku: variant.sku || '',
      price: variant.price,
      originalPrice: variant.originalPrice || undefined,
      stock: variant.stock,
      image_url: variant.image_url || '',
      attributes: (variant.attributes as Record<string, string>) || {},
      isDefault: variant.isDefault,
      isActive: variant.isActive,
    });
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const variantData = {
        name: formData.name,
        sku: formData.sku || undefined,
        price: formData.price,
        originalPrice: formData.originalPrice || undefined,
        stock: formData.stock,
        image_url: formData.image_url || undefined,
        attributes: formData.attributes,
        isDefault: formData.isDefault,
        isActive: formData.isActive,
        position: editingIndex !== null ? editingIndex : variants.length,
      };

      if (editingIndex !== null && formData.id && !formData.id.startsWith('temp-')) {
        // Update existing variant
        await updateVariant.mutateAsync({
          id: formData.id,
          productId,
          ...variantData,
        });
        addToast('Variante actualizada', 'success');
      } else {
        // Create new variant
        await createVariant.mutateAsync({
          productId,
          variant: variantData,
        });
        addToast('Variante creada', 'success');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving variant:', error);
      addToast('Error al guardar la variante', 'error');
    }
  };

  const handleDelete = async (index: number) => {
    const variant = variants[index];
    if (!confirm('¿Eliminar esta variante?')) return;

    try {
      if (variant.id && !variant.id.startsWith('temp-')) {
        await deleteVariant.mutateAsync({ id: variant.id, productId });
        addToast('Variante eliminada', 'success');
      } else {
        // Local only variant
        const updated = variants.filter((_, i) => i !== index);
        onVariantsChange(updated);
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      addToast('Error al eliminar la variante', 'error');
    }
  };

  const handleAttributeChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value,
      },
    }));
  };

  const handleRemoveAttribute = (key: string) => {
    setFormData((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _removed, ...rest } = prev.attributes;
      return { ...prev, attributes: rest };
    });
  };

  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  const handleAddAttribute = () => {
    if (newAttrKey && newAttrValue) {
      handleAttributeChange(newAttrKey.toLowerCase(), newAttrValue);
      setNewAttrKey('');
      setNewAttrValue('');
    }
  };

  const formatAttributes = (attrs: Record<string, string> | null) => {
    if (!attrs) return '-';
    return Object.entries(attrs)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Variantes del Producto
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openAddModal}
          disabled={disabled || isSaving}
        >
          <Plus size={16} className="mr-1" />
          Agregar Variante
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : variants.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No hay variantes. Agrega variantes para productos con diferentes opciones (potencia, voltaje, color, etc.)
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {variants.map((variant, index) => (
            <div
              key={variant.id}
              className={`border rounded-lg ${
                variant.isDefault
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div
                className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex items-center gap-3">
                  <GripVertical size={16} className="text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {variant.name}
                      </span>
                      {variant.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-2 py-0.5 rounded">
                          Principal
                        </span>
                      )}
                      {!variant.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ${variant.price.toLocaleString()} · Stock: {variant.stock}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(index);
                    }}
                    disabled={disabled || isSaving}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    disabled={disabled || isSaving}
                    className="text-red-500 hover:text-red-600"
                  >
                    {deleteVariant.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </Button>
                  {expandedIndex === index ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </div>
              </div>

              {expandedIndex === index && (
                <div className="px-3 pb-3 pt-0 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">SKU:</span>{' '}
                      <span className="text-gray-900 dark:text-white">{variant.sku || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Precio Original:</span>{' '}
                      <span className="text-gray-900 dark:text-white">
                        {variant.originalPrice ? `$${variant.originalPrice.toLocaleString()}` : '-'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">Atributos:</span>{' '}
                      <span className="text-gray-900 dark:text-white">
                        {formatAttributes(variant.attributes as Record<string, string>)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para agregar/editar variante */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingIndex !== null ? 'Editar Variante' : 'Nueva Variante'}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            label="Nombre de la Variante"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: 1/4 HP - 110V"
            required
          />

          <Input
            label="SKU"
            value={formData.sku || ''}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="Ej: COMP-1/4-110"
          />

          <div className="grid grid-cols-2 gap-4">
            <PriceInput
              label="Precio"
              value={formData.price}
              onChange={(val) => setFormData({ ...formData, price: val })}
              required
            />
            <PriceInput
              label="Precio Original"
              value={formData.originalPrice || 0}
              onChange={(val) => setFormData({ ...formData, originalPrice: val || undefined })}
            />
          </div>

          <Input
            label="Stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
            required
          />

          {/* Atributos */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Atributos
            </label>

            {/* Atributos comunes como botones rápidos */}
            <div className="flex flex-wrap gap-2">
              {COMMON_ATTRIBUTES.map((attr) => (
                <button
                  key={attr.key}
                  type="button"
                  onClick={() => {
                    if (!formData.attributes[attr.key]) {
                      handleAttributeChange(attr.key, attr.examples[0]);
                    }
                  }}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                    formData.attributes[attr.key]
                      ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                  }`}
                >
                  + {attr.label}
                </button>
              ))}
            </div>

            {/* Atributos actuales */}
            {Object.keys(formData.attributes).length > 0 && (
              <div className="space-y-2">
                {Object.entries(formData.attributes).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize w-24">
                      {key}:
                    </span>
                    <Input
                      value={value}
                      onChange={(e) => handleAttributeChange(key, e.target.value)}
                      className="flex-1"
                      placeholder={`Valor de ${key}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttribute(key)}
                      className="text-red-500"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Agregar atributo personalizado */}
            <div className="flex items-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <Input
                label="Nuevo Atributo"
                value={newAttrKey}
                onChange={(e) => setNewAttrKey(e.target.value)}
                placeholder="Ej: refrigerante"
                className="flex-1"
              />
              <Input
                label="Valor"
                value={newAttrValue}
                onChange={(e) => setNewAttrValue(e.target.value)}
                placeholder="Ej: R410A"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAttribute}
                disabled={!newAttrKey || !newAttrValue}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Imagen */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Imagen de la Variante
            </label>
            <ImageUpload
              value={formData.image_url || ''}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
            />
            <p className="text-xs text-gray-500">
              Opcional. Si no se especifica, se usará la imagen principal del producto.
            </p>
          </div>

          {/* Opciones */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">Variante Principal</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">Activa</span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!formData.name || formData.price <= 0 || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Guardando...
                </>
              ) : editingIndex !== null ? (
                'Guardar Cambios'
              ) : (
                'Agregar Variante'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
