import Link from 'next/link';
import { Metadata } from 'next';
import { Search } from 'lucide-react';
import ProductCard from '@/components/features/products/ProductCard';
import ProductFiltersContainer from '@/components/features/products/ProductFiltersContainer';
import MobileFilters from '@/components/features/products/MobileFilters';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
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

interface CategoryStructure {
  name: string;
  subcategories: string[];
}

export const metadata: Metadata = {
  title: 'Catálogo de Productos',
  description: 'Explora nuestro catálogo completo de repuestos de refrigeración, aire acondicionado, herramientas y materiales eléctricos.',
  alternates: {
    canonical: '/products',
  },
};

interface MetadataResponse {
  categories: string[];
  brands: string[];
  structure: CategoryStructure[];
}

async function getMetadata(): Promise<MetadataResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${apiUrl}/products/metadata`, {
      next: { revalidate: 600 } // 10 minutes cache
    });
    if (!res.ok) return { categories: [], brands: [], structure: [] };
    return res.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return { categories: [], brands: [], structure: [] };
  }
}

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }): Promise<ProductsResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const params = new URLSearchParams();
  
  if (searchParams.search) params.append('search', searchParams.search as string);
  if (searchParams.category) params.append('category', searchParams.category as string);
  if (searchParams.subcategory) params.append('subcategory', searchParams.subcategory as string);
  if (searchParams.brand) params.append('brand', searchParams.brand as string);
  if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice as string);
  if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice as string);
  params.append('page', (searchParams.page || '1') as string);
  params.append('limit', '12');

  try {
    const res = await fetch(`${apiUrl}/products?${params.toString()}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      return { data: [], meta: { total: 0, page: 1, lastPage: 1 } };
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: [], meta: { total: 0, page: 1, lastPage: 1 } };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  const [metadata, productsData] = await Promise.all([
    getMetadata(),
    getProducts(resolvedParams)
  ]);

  const products = productsData.data || [];
  const meta = productsData.meta || { total: 0, page: 1, lastPage: 1 };
  
  const categories = metadata.categories || [];
  const brands = metadata.brands || [];
  const structure = metadata.structure || [];

  // Calculate subcategories based on selected category
  const selectedCategory = resolvedParams.category as string;
  const subcategories = selectedCategory 
    ? structure.find((c) => c.name === selectedCategory)?.subcategories || []
    : [];

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catálogo de Productos</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Explora nuestra variedad de repuestos y equipos.</p>
        </div>
        
        <div className="w-full md:w-auto flex gap-2 justify-end">
          <MobileFilters 
            categories={categories}
            subcategories={subcategories}
            brands={brands}
            structure={structure}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de Filtros (Desktop) */}
        <aside className="hidden lg:block lg:w-64 shrink-0">
          <ProductFiltersContainer
            categories={categories}
            subcategories={subcategories}
            brands={brands}
            structure={structure}
          />
        </aside>

        {/* Grid de Productos */}
        <div className="flex-1">
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-8">
                {products.map((product: Product, index: number) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    priority={index < 6}
                  />
                ))}
              </div>

              <Pagination 
                currentPage={meta.page} 
                lastPage={meta.lastPage} 
              />
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 border-dashed transition-colors">
              <Search className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron productos</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Intenta con otros términos de búsqueda o filtros.</p>
              <div className="mt-6">
                <Link href="/products">
                  <Button variant="outline">
                    Limpiar filtros
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}