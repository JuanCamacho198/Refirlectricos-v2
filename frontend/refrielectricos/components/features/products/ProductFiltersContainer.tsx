'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import ProductFilters from './ProductFilters';

interface ProductFiltersContainerProps {
  categories: string[];
  subcategories: string[];
  brands: string[];
  className?: string;
  // Structure for subcategories mapping if needed, based on page.tsx logic
  structure?: { name: string; subcategories: string[] }[];
}

export default function ProductFiltersContainer({
  categories,
  subcategories: initialSubcategories, // These might be all subcategories or filtered ones
  brands,
  className,
  structure
}: ProductFiltersContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category');
  const selectedSubcategory = searchParams.get('subcategory');
  const selectedBrand = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  // Calculate subcategories based on selected category if structure is provided
  const subcategories = selectedCategory && structure
    ? structure.find((c) => c.name === selectedCategory)?.subcategories || []
    : initialSubcategories;

  const updateUrl = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') {
      params.set('page', '1');
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    // Reset subcategory when category changes
    params.delete('subcategory');
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  const handleSubcategoryChange = (subcategory: string | null) => {
    updateUrl('subcategory', subcategory);
  };

  const handleBrandChange = (brand: string | null) => {
    updateUrl('brand', brand);
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(type === 'min' ? 'minPrice' : 'maxPrice', value);
    } else {
      params.delete(type === 'min' ? 'minPrice' : 'maxPrice');
    }
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/products');
  };

  return (
    <ProductFilters
      categories={categories}
      subcategories={subcategories}
      brands={brands}
      selectedCategory={selectedCategory}
      selectedSubcategory={selectedSubcategory}
      selectedBrand={selectedBrand}
      priceRange={{ min: minPrice || '', max: maxPrice || '' }}
      onCategoryChange={handleCategoryChange}
      onSubcategoryChange={handleSubcategoryChange}
      onBrandChange={handleBrandChange}
      onPriceRangeChange={handlePriceRangeChange}
      onClearFilters={clearFilters}
      className={className}
    />
  );
}
