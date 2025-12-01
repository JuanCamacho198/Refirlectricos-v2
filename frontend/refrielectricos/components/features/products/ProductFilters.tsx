'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Input from '@/components/ui/Input';

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
  const hasActiveFilters = selectedCategory || selectedSubcategory || selectedBrand || priceRange.min || priceRange.max;
  
  // Estado local para debounce
  const [localMin, setLocalMin] = useState(priceRange.min);
  const [localMax, setLocalMax] = useState(priceRange.max);
  const debounceMin = useRef<NodeJS.Timeout | null>(null);
  const debounceMax = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar estado local si cambia desde fuera (ej. limpiar filtros)
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
    const value = e.target.value;
    setLocalMin(value);
    if (debounceMin.current) clearTimeout(debounceMin.current);
    debounceMin.current = setTimeout(() => {
      onPriceRangeChange('min', value);
    }, 500);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalMax(value);
    if (debounceMax.current) clearTimeout(debounceMax.current);
    debounceMax.current = setTimeout(() => {
      onPriceRangeChange('max', value);
    }, 500);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24 transition-colors ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filtros</h3>
        {hasActiveFilters && (
          <button 
            onClick={onClearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <X size={14} /> Limpiar
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Categorías */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-3">Categorías</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="category"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                checked={selectedCategory === null}
                onChange={() => onCategoryChange(null)}
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Todas</span>
            </label>
            {categories.map(category => (
              <label key={category} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  checked={selectedCategory === category}
                  onChange={() => onCategoryChange(category)}
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subcategorías */}
        {subcategories.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-3">Subcategorías</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="subcategory"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  checked={selectedSubcategory === null}
                  onChange={() => onSubcategoryChange(null)}
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Todas</span>
              </label>
              {subcategories.map(subcategory => (
                <label key={subcategory} className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="subcategory"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    checked={selectedSubcategory === subcategory}
                    onChange={() => onSubcategoryChange(subcategory)}
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{subcategory}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Marcas */}
        {brands.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-3">Marcas</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="brand"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  checked={selectedBrand === null}
                  onChange={() => onBrandChange(null)}
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Todas</span>
              </label>
              {brands.map(brand => (
                <label key={brand} className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="brand"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    checked={selectedBrand === brand}
                    onChange={() => onBrandChange(brand)}
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{brand}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Precio */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-3">Precio</h4>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={localMin}
              onChange={handleMinChange}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={localMax}
              onChange={handleMaxChange}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
