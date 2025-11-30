'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import ProductCard from '@/components/features/products/ProductCard';
import ProductCardSkeleton from '@/components/features/products/ProductCardSkeleton';
import ProductFilters from '@/components/features/products/ProductFilters';
import Button from '@/components/ui/Button';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/product';

interface PaginationMeta {
  total: number;
  page: number;
  lastPage: number;
}

interface ProductsResponse {
  data: Product[];
  meta: PaginationMeta;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Estado local para input de búsqueda (para no actualizar URL en cada tecla)
  const [localSearchTerm, setLocalSearchTerm] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Filtros desde URL
  const searchTerm = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category');
  const selectedBrand = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const page = parseInt(searchParams.get('page') || '1');

  // Query para Metadata (Categorías y Marcas)
  const { data: metadata } = useQuery({
    queryKey: ['products-metadata'],
    queryFn: async () => {
      const { data } = await api.get('/products/metadata');
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  // Query para Productos
  const { data: productsData, isLoading } = useQuery<ProductsResponse>({
    queryKey: ['products', page, searchTerm, selectedCategory, selectedBrand, minPrice, maxPrice],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('page', page.toString());
      params.append('limit', '12');

      const { data } = await api.get(`/products?${params.toString()}`);
      return data;
    },
  });

  const products = productsData?.data || [];
  const meta = productsData?.meta || { total: 0, page: 1, lastPage: 1 };
  const categories = metadata?.categories || [];
  const brands = metadata?.brands || [];

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

  const handleSearch = (value: string) => {
    setLocalSearchTerm(value);
    // Debounce manual o esperar enter
    const timeoutId = setTimeout(() => {
      updateUrl('search', value || null);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleCategoryChange = (category: string | null) => {
    updateUrl('category', category);
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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setLocalSearchTerm('');
    router.push('/products');
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catálogo de Productos</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Explora nuestra variedad de repuestos y equipos.</p>
        </div>
        
        <div className="w-full md:w-auto flex gap-2">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar productos..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              value={localSearchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="md:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de Filtros */}
        <aside className={`lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <ProductFilters
            categories={categories}
            brands={brands}
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            priceRange={{ min: minPrice || '', max: maxPrice || '' }}
            onCategoryChange={handleCategoryChange}
            onBrandChange={handleBrandChange}
            onPriceRangeChange={handlePriceRangeChange}
            onClearFilters={clearFilters}
          />
        </aside>

        {/* Grid de Productos */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Paginación */}
              {meta.lastPage > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={meta.page === 1}
                    onClick={() => handlePageChange(meta.page - 1)}
                    className="p-2"
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Página {meta.page} de {meta.lastPage}
                  </span>

                  <Button
                    variant="outline"
                    disabled={meta.page === meta.lastPage}
                    onClick={() => handlePageChange(meta.page + 1)}
                    className="p-2"
                  >
                    <ChevronRight size={20} />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 border-dashed transition-colors">
              <Search className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron productos</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Intenta con otros términos de búsqueda o filtros.</p>
              <div className="mt-6">
                <Button onClick={clearFilters} variant="outline">
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando catálogo...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
