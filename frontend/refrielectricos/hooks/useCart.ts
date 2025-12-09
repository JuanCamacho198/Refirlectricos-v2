import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';
import { useEffect } from 'react';
import { Product, ProductVariant } from '@/types/product';

interface CartApiItem {
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
}

interface CartApiData {
  items: CartApiItem[];
}

export const useCart = () => {
  const { isAuthenticated } = useAuth();
  
  // Select specific parts of the store to avoid unnecessary re-renders and infinite loops
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const setItems = useCartStore((state) => state.setItems);
  const localAddItem = useCartStore((state) => state.addItem);
  const localRemoveItem = useCartStore((state) => state.removeItem);
  const localUpdateQuantity = useCartStore((state) => state.updateQuantity);
  const localClearCart = useCartStore((state) => state.clearCart);

  const queryClient = useQueryClient();

  // Fetch cart from DB if user is logged in
  const { data: dbCart } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get('/cart');
      return data;
    },
    enabled: isAuthenticated,
  });

  // Sync DB cart to local store
  useEffect(() => {
    if (isAuthenticated && dbCart) {
      const mappedItems = dbCart.items.map((item: CartApiItem) => ({
        id: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        product: item.product,
        variant: item.variant,
      }));
      setItems(mappedItems);
    }
  }, [isAuthenticated, dbCart, setItems]);

  // Mutations
  const addToCartMutation = useMutation({
    mutationFn: async ({ product, quantity, variant }: { product: Product, quantity: number, variant?: ProductVariant }) => {
      return api.post('/cart/items', { productId: product.id, variantId: variant?.id, quantity });
    },
    onMutate: async ({ product, quantity, variant }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartApiData>(['cart']);

      // Optimistic update
      localAddItem(product, quantity, variant);
      
      queryClient.setQueryData<CartApiData>(['cart'], (old) => {
        if (!old) return old;
        // Check if item exists (same product + variant combo)
        const exists = old.items.find(
          (item) => item.productId === product.id && item.variantId === variant?.id
        );
        if (exists) {
          return {
            ...old,
            items: old.items.map((item) => 
              item.productId === product.id && item.variantId === variant?.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          };
        }
        return {
          ...old,
          items: [...old.items, { productId: product.id, variantId: variant?.id, quantity, product, variant }]
        };
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
        // Re-sync zustand from previous cart
        const mappedItems = context.previousCart.items.map((item) => ({
          id: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          product: item.product,
          variant: item.variant,
        }));
        setItems(mappedItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity, variantId }: { productId: string, quantity: number, variantId?: string }) => {
      const endpoint = variantId 
        ? `/cart/items/${productId}?variantId=${variantId}` 
        : `/cart/items/${productId}`;
      return api.patch(endpoint, { quantity });
    },
    onMutate: async ({ productId, quantity, variantId }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartApiData>(['cart']);

      // Optimistic update
      localUpdateQuantity(productId, quantity, variantId);

      queryClient.setQueryData<CartApiData>(['cart'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) => 
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity }
              : item
          )
        };
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
        // Re-sync zustand
        const mappedItems = context.previousCart.items.map((item) => ({
          id: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          product: item.product,
          variant: item.variant,
        }));
        setItems(mappedItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async ({ productId, variantId }: { productId: string, variantId?: string }) => {
      const endpoint = variantId 
        ? `/cart/items/${productId}?variantId=${variantId}` 
        : `/cart/items/${productId}`;
      return api.delete(endpoint);
    },
    onMutate: async ({ productId, variantId }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartApiData>(['cart']);

      // Optimistic update
      localRemoveItem(productId, variantId);

      queryClient.setQueryData<CartApiData>(['cart'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          )
        };
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
        // Re-sync zustand
        const mappedItems = context.previousCart.items.map((item) => ({
          id: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          product: item.product,
          variant: item.variant,
        }));
        setItems(mappedItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      return api.delete('/cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Merge local cart on login
  const mergeCartMutation = useMutation({
    mutationFn: async (items: { productId: string, quantity: number }[]) => {
      return api.post('/cart/merge', items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Wrapper functions
  const addItem = (product: Product, quantity = 1, variant?: ProductVariant) => {
    if (isAuthenticated) {
      addToCartMutation.mutate({ product, quantity, variant });
    } else {
      localAddItem(product, quantity, variant);
    }
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (isAuthenticated) {
      updateQuantityMutation.mutate({ productId, quantity, variantId });
    } else {
      localUpdateQuantity(productId, quantity, variantId);
    }
  };

  const removeItem = (productId: string, variantId?: string) => {
    if (isAuthenticated) {
      removeFromCartMutation.mutate({ productId, variantId });
    } else {
      localRemoveItem(productId, variantId);
    }
  };

  const clearCart = () => {
    if (isAuthenticated) {
      clearCartMutation.mutate();
    } else {
      localClearCart();
    }
  };

  // Calculate total - use variant price if available
  const totalPrice = items.reduce(
    (total, item) => {
      const price = item.variant?.price ?? item.product.price;
      return total + price * item.quantity;
    },
    0
  );

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return {
    toggleCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    mergeCart: mergeCartMutation.mutateAsync,
    items,
    isOpen,
    totalPrice,
    totalItems,
    isLoading: isAuthenticated && !dbCart,
  };
};
