import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Product } from '@/types/product';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      // Solicitamos un límite alto para obtener "todos" los productos en contextos donde no hay paginación explícita (Home, Admin)
      const { data } = await api.get('/products?limit=50');
      
      // Manejar respuesta paginada { data: [], meta: ... }
      if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
        return data.data as Product[];
      }
      
      // Manejar respuesta array simple (legacy o si cambia el backend)
      if (Array.isArray(data)) {
        return data as Product[];
      }

      return [] as Product[];
    },
  });
};

// Hook for admin panel - includes inactive products
export const useAdminProducts = () => {
  return useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      // Include inactive products for admin panel
      const { data } = await api.get('/products?limit=100&includeInactive=true');
      
      // Manejar respuesta paginada { data: [], meta: ... }
      if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
        return data.data as Product[];
      }
      
      // Manejar respuesta array simple
      if (Array.isArray(data)) {
        return data as Product[];
      }

      return [] as Product[];
    },
  });
};

export const useProduct = (term: string) => {
  return useQuery({
    queryKey: ['product', term],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${term}`);
      return data;
    },
    enabled: !!term,
  });
};

// Hook for fetching product by variant slug
// Returns both the product and the selected variant
export const useProductByVariantSlug = (variantSlug: string) => {
  return useQuery({
    queryKey: ['variant', variantSlug],
    queryFn: async () => {
      const { data } = await api.get(`/products/variants/${variantSlug}`);
      return data;
    },
    enabled: !!variantSlug,
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/products/${id}`);
      return data as { status?: 'deleted' | 'archived'; message?: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const { data } = await api.post<Product>('/products', product);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data } = await api.patch<Product>(`/products/${id}`, product);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
      if (data.slug) {
        queryClient.invalidateQueries({ queryKey: ['product', data.slug] });
      }
    },
  });
};

export const useProductMetadata = () => {
  return useQuery({
    queryKey: ['productMetadata'],
    queryFn: async () => {
      const { data } = await api.get<{
        categories: string[];
        brands: string[];
        structure: { name: string; subcategories: string[] }[];
      }>('/products/metadata');
      return data;
    },
  });
};
