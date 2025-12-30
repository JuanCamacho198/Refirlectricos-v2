'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Check, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  categories: string[];
  subcategories: string[];
  brands: string[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  selectedBrand: string | null;
  priceRange: { min: string; max: string };
  onCategoryChange: (category: string | null) => void;
  onSubcategoryChange: (subcategory: string | null) => void;
  onBrandChange: (brand: string | null) => void;
  onPriceRangeChange: (type: 'min' | 'max', value: string) => void;
  onClearFilters: () => void;
  className?: string;
}

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  count?: number;
  hasValue?: boolean;
}

function FilterSection({ title, isOpen, onToggle, children, count, hasValue }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-4 text-left group"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
            {title}
          </span>
          {count !== undefined && count > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              {count}
            </span>
          )}
          {hasValue && (
            <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180',
            'group-hover:text-blue-600 dark:group-hover:text-blue-400'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function ProductFilters({
  categories,
  subcategories,
  brands,
  selectedCategory,
  selectedSubcategory,
  selectedBrand,
  priceRange,
  onCategoryChange,
  onSubcategoryChange,
  onBrandChange,
  onPriceRangeChange,
  onClearFilters,
  className
}: ProductFiltersProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    subcategories: subcategories.length > 0,
    brands: brands.length > 0,
    price: true
  });
  const [localMin, setLocalMin] = useState(priceRange.min);
  const [localMax, setLocalMax] = useState(priceRange.max);
  const debounceMin = useRef<NodeJS.Timeout | null>(null);
  const debounceMax = useRef<NodeJS.Timeout | null>(null);
  const prevMin = useRef(priceRange.min);
  const prevMax = useRef(priceRange.max);

  useEffect(() => {
    if (priceRange.min !== prevMin.current) {
      const t = setTimeout(() => setLocalMin(priceRange.min), 0);
      prevMin.current = priceRange.min;
      return () => clearTimeout(t);
    }
  }, [priceRange.min]);

  useEffect(() => {
    if (priceRange.max !== prevMax.current) {
      const t = setTimeout(() => setLocalMax(priceRange.max), 0);
      prevMax.current = priceRange.max;
      return () => clearTimeout(t);
    }
  }, [priceRange.max]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setLocalMin(value);
    if (debounceMin.current) clearTimeout(debounceMin.current);
    debounceMin.current = setTimeout(() => {
      onPriceRangeChange('min', value);
    }, 500);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setLocalMax(value);
    if (debounceMax.current) clearTimeout(debounceMax.current);
    debounceMax.current = setTimeout(() => {
      onPriceRangeChange('max', value);
    }, 500);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = selectedCategory || selectedSubcategory || selectedBrand || priceRange.min || priceRange.max;

  const formatPrice = (value: string) => {
    if (!value) return '';
    const num = parseInt(value);
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden',
        'sticky top-24 transition-all duration-300',
        className
      )}
    >
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filtros</h3>
              {hasActiveFilters && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedCategory || selectedSubcategory || selectedBrand ? 'Filtros activos' : 'Rango de precio activo'}
                </p>
              )}
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="group flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400
                         bg-red-50 dark:bg-red-900/20 rounded-lg transition-all duration-200
                         hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-105"
            >
              <X size={14} className="group-hover:rotate-90 transition-transform duration-200" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-1">
        <FilterSection
          title="Categorías"
          isOpen={openSections.categories}
          onToggle={() => toggleSection('categories')}
          count={selectedCategory ? 1 : 0}
          hasValue={!!selectedCategory}
        >
          <div className="space-y-1.5 pt-1">
            <label
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200',
                'hover:bg-gray-100 dark:hover:bg-gray-700/50',
                selectedCategory === null && 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                  selectedCategory === null
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              >
                {selectedCategory === null && <Check size={12} strokeWidth={3} />}
              </div>
              <input
                type="radio"
                name="category"
                className="hidden"
                checked={selectedCategory === null}
                onChange={() => onCategoryChange(null)}
              />
              <span className={cn(
                'text-sm font-medium transition-colors',
                selectedCategory === null
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300'
              )}>
                Todas las categorías
              </span>
            </label>
            {categories.map(category => (
              <label
                key={category}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200',
                  'hover:bg-gray-100 dark:hover:bg-gray-700/50',
                  selectedCategory === category && 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                    selectedCategory === category
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                >
                  {selectedCategory === category && <Check size={12} strokeWidth={3} />}
                </div>
                <input
                  type="radio"
                  name="category"
                  className="hidden"
                  checked={selectedCategory === category}
                  onChange={() => onCategoryChange(category)}
                />
                <span className={cn(
                  'text-sm font-medium transition-colors truncate',
                  selectedCategory === category
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300'
                )}>
                  {category}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {subcategories.length > 0 && (
          <FilterSection
            title="Subcategorías"
            isOpen={openSections.subcategories}
            onToggle={() => toggleSection('subcategories')}
            count={selectedSubcategory ? 1 : 0}
            hasValue={!!selectedSubcategory}
          >
            <div className="space-y-1.5 pt-1">
              <label
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200',
                  'hover:bg-gray-100 dark:hover:bg-gray-700/50',
                  selectedSubcategory === null && 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                    selectedSubcategory === null
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                >
                  {selectedSubcategory === null && <Check size={12} strokeWidth={3} />}
                </div>
                <input
                  type="radio"
                  name="subcategory"
                  className="hidden"
                  checked={selectedSubcategory === null}
                  onChange={() => onSubcategoryChange(null)}
                />
                <span className={cn(
                  'text-sm font-medium transition-colors',
                  selectedSubcategory === null
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300'
                )}>
                  Todas
                </span>
              </label>
              {subcategories.map(subcategory => (
                <label
                  key={subcategory}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200',
                    'hover:bg-gray-100 dark:hover:bg-gray-700/50',
                    selectedSubcategory === subcategory && 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                      selectedSubcategory === subcategory
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 dark:border-gray-600'
                    )}
                  >
                    {selectedSubcategory === subcategory && <Check size={12} strokeWidth={3} />}
                  </div>
                  <input
                    type="radio"
                    name="subcategory"
                    className="hidden"
                    checked={selectedSubcategory === subcategory}
                    onChange={() => onSubcategoryChange(subcategory)}
                  />
                  <span className={cn(
                    'text-sm font-medium transition-colors truncate',
                    selectedSubcategory === subcategory
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300'
                  )}>
                    {subcategory}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {brands.length > 0 && (
          <FilterSection
            title="Marcas"
            isOpen={openSections.brands}
            onToggle={() => toggleSection('brands')}
            count={selectedBrand ? 1 : 0}
            hasValue={!!selectedBrand}
          >
            <div className="space-y-1.5 pt-1">
              <label
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200',
                  'hover:bg-gray-100 dark:hover:bg-gray-700/50',
                  selectedBrand === null && 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                    selectedBrand === null
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                >
                  {selectedBrand === null && <Check size={12} strokeWidth={3} />}
                </div>
                <input
                  type="radio"
                  name="brand"
                  className="hidden"
                  checked={selectedBrand === null}
                  onChange={() => onBrandChange(null)}
                />
                <span className={cn(
                  'text-sm font-medium transition-colors',
                  selectedBrand === null
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300'
                )}>
                  Todas las marcas
                </span>
              </label>
              {brands.map(brand => (
                <label
                  key={brand}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200',
                    'hover:bg-gray-100 dark:hover:bg-gray-700/50',
                    selectedBrand === brand && 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                      selectedBrand === brand
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 dark:border-gray-600'
                    )}
                  >
                    {selectedBrand === brand && <Check size={12} strokeWidth={3} />}
                  </div>
                  <input
                    type="radio"
                    name="brand"
                    className="hidden"
                    checked={selectedBrand === brand}
                    onChange={() => onBrandChange(brand)}
                  />
                  <span className={cn(
                    'text-sm font-medium transition-colors truncate',
                    selectedBrand === brand
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300'
                  )}>
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        <FilterSection
          title="Precio"
          isOpen={openSections.price}
          onToggle={() => toggleSection('price')}
          count={(priceRange.min ? 1 : 0) + (priceRange.max ? 1 : 0)}
          hasValue={!!priceRange.min || !!priceRange.max}
        >
          <div className="pt-2 space-y-4">
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Mínimo"
                    value={localMin}
                    onChange={handleMinChange}
                    className="w-full pl-7 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 
                               rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                               dark:text-white dark:placeholder:text-gray-500 transition-all duration-200"
                  />
                </div>
                <span className="text-gray-400 dark:text-gray-500">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Máximo"
                    value={localMax}
                    onChange={handleMaxChange}
                    className="w-full pl-7 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 
                               rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                               dark:text-white dark:placeholder:text-gray-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
            
            {(localMin || localMax) && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-sm text-gray-500 dark:text-gray-400">Rango seleccionado:</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatPrice(localMin || '0')} - {formatPrice(localMax || '∞')}
                </span>
              </div>
            )}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
