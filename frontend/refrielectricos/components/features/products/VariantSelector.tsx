'use client';

import { useRouter } from 'next/navigation';
import { ProductVariant } from '@/types/product';
import { cn, formatCurrency } from '@/lib/utils';
import { Check } from 'lucide-react';

interface VariantSelectorProps {
  variants: ProductVariant[];
  currentVariantId?: string;
}

export default function VariantSelector({
  variants,
  currentVariantId,
}: VariantSelectorProps) {
  const router = useRouter();

  if (!variants || variants.length === 0) {
    return null;
  }

  // Get the first attribute key to use as grouping label
  const getMainAttribute = (variant: ProductVariant) => {
    if (!variant.attributes) return { label: 'Variante', value: variant.name };
    const entries = Object.entries(variant.attributes);
    if (entries.length === 0) return { label: 'Variante', value: variant.name };
    return { label: entries[0][0], value: entries[0][1] };
  };

  // Group variants by the first attribute label
  const firstVariant = variants[0];
  const mainAttrLabel = getMainAttribute(firstVariant).label;

  const handleVariantSelect = (variant: ProductVariant) => {
    // Navigate to the variant's own page
    router.push(`/products/${variant.slug}`);
  };

  // Check if all variants have the same first attribute key
  const hasUniformAttributes = variants.every((v) => {
    const attr = getMainAttribute(v);
    return attr.label === mainAttrLabel;
  });

  // If uniform attributes, show as pills
  if (hasUniformAttributes) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {mainAttrLabel}
        </h3>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const isSelected = variant.id === currentVariantId;
            const isOutOfStock = variant.stock === 0;
            const mainAttr = getMainAttribute(variant);

            return (
              <button
                key={variant.id}
                onClick={() => handleVariantSelect(variant)}
                disabled={isOutOfStock}
                className={cn(
                  'relative flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600',
                  isOutOfStock &&
                    'cursor-not-allowed opacity-50 line-through',
                )}
              >
                {isSelected && (
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
                <span>{mainAttr.value}</span>
                <span
                  className={cn(
                    'text-xs',
                    isSelected
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400',
                  )}
                >
                  {formatCurrency(variant.price)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Multiple or non-uniform attribute types - show as a list with more details
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Variantes disponibles
      </h3>
      <div className="grid gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === currentVariantId;
          const isOutOfStock = variant.stock === 0;
          const attributes = variant.attributes || {};

          return (
            <button
              key={variant.id}
              onClick={() => handleVariantSelect(variant)}
              disabled={isOutOfStock}
              className={cn(
                'relative flex items-center justify-between rounded-lg border p-3 text-left transition-all',
                isSelected
                  ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600',
                isOutOfStock && 'cursor-not-allowed opacity-50',
              )}
            >
              <div className="flex items-center gap-3">
                {isSelected && (
                  <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isSelected
                        ? 'text-blue-700 dark:text-blue-400'
                        : 'text-gray-900 dark:text-gray-100',
                      isOutOfStock && 'line-through',
                    )}
                  >
                    {variant.name}
                  </p>
                  <div className="flex flex-wrap gap-x-3 text-xs text-gray-500 dark:text-gray-400">
                    {Object.entries(attributes).map(([key, value]) => (
                      <span key={key}>
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isSelected
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-gray-900 dark:text-gray-100',
                  )}
                >
                  {formatCurrency(variant.price)}
                </p>
                {isOutOfStock ? (
                  <span className="text-xs text-red-500">Agotado</span>
                ) : (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    {variant.stock} disponibles
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
