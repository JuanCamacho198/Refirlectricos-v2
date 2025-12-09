import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Product, ProductVariant } from '@/types/product';

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

// ==================== VARIANT HOOKS ====================

export const useProductVariants = (productId: string) => {
  return useQuery({
    queryKey: ['variants', productId],
    queryFn: async () => {
      const { data } = await api.get<ProductVariant[]>(
        `/products/${productId}/variants?includeInactive=true`
      );
      return data;
    },
    enabled: !!productId,
  });
};

export const useCreateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      variant,
    }: {
      productId: string;
      variant: Partial<ProductVariant>;
    }) => {
      const { data } = await api.post<ProductVariant>(
        `/products/${productId}/variants`,
        variant
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['variants', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
  });
};

export const useCreateVariantsBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      variants,
    }: {
      productId: string;
      variants: Partial<ProductVariant>[];
    }) => {
      const { data } = await api.post<ProductVariant[]>(
        `/products/${productId}/variants/bulk`,
        variants
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['variants', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
  });
};

export const useUpdateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      productId,
      ...variant
    }: Partial<ProductVariant> & { id: string; productId: string }) => {
      const { data } = await api.patch<ProductVariant>(`/products/variants/${id}`, variant);
      return { data, productId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['variants', result.productId] });
      queryClient.invalidateQueries({ queryKey: ['product', result.productId] });
    },
  });
};

export const useDeleteVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      await api.delete(`/products/variants/${id}`);
      return { productId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['variants', result.productId] });
      queryClient.invalidateQueries({ queryKey: ['product', result.productId] });
    },
  });
};
