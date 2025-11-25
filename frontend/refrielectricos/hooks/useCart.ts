import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';
import { useEffect } from 'react';
import { Product } from '@/types/product';

interface CartApiItem {
  productId: string;
  quantity: number;
  product: Product;
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
      const mappedItems = dbCart.items.map((item: { productId: string; quantity: number; product: Product }) => ({
        id: item.productId,
        quantity: item.quantity,
        product: item.product,
      }));
      setItems(mappedItems);
    }
  }, [isAuthenticated, dbCart, setItems]);

  // Mutations
  const addToCartMutation = useMutation({
    mutationFn: async ({ product, quantity }: { product: Product, quantity: number }) => {
      return api.post('/cart/items', { productId: product.id, quantity });
    },
    onMutate: async ({ product, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartApiData>(['cart']);

      // Optimistic update
      localAddItem(product, quantity);
      
      queryClient.setQueryData<CartApiData>(['cart'], (old) => {
        if (!old) return old;
        // Check if item exists
        const exists = old.items.find((item) => item.productId === product.id);
        if (exists) {
          return {
            ...old,
            items: old.items.map((item) => 
              item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item
            )
          };
        }
        return {
          ...old,
          items: [...old.items, { productId: product.id, quantity, product }]
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
          quantity: item.quantity,
          product: item.product,
        }));
        setItems(mappedItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string, quantity: number }) => {
      return api.patch(`/cart/items/${productId}`, { quantity });
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartApiData>(['cart']);

      // Optimistic update
      localUpdateQuantity(productId, quantity);

      queryClient.setQueryData<CartApiData>(['cart'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) => 
            item.productId === productId ? { ...item, quantity } : item
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
          quantity: item.quantity,
          product: item.product,
        }));
        setItems(mappedItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      return api.delete(`/cart/items/${productId}`);
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartApiData>(['cart']);

      // Optimistic update
      localRemoveItem(productId);

      queryClient.setQueryData<CartApiData>(['cart'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((item) => item.productId !== productId)
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
          quantity: item.quantity,
          product: item.product,
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
  const addItem = (product: Product, quantity = 1) => {
    if (isAuthenticated) {
      addToCartMutation.mutate({ product, quantity });
    } else {
      localAddItem(product, quantity);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (isAuthenticated) {
      updateQuantityMutation.mutate({ productId, quantity });
    } else {
      localUpdateQuantity(productId, quantity);
    }
  };

  const removeItem = (productId: string) => {
    if (isAuthenticated) {
      removeFromCartMutation.mutate(productId);
    } else {
      localRemoveItem(productId);
    }
  };

  const clearCart = () => {
    if (isAuthenticated) {
      clearCartMutation.mutate();
    } else {
      localClearCart();
    }
  };

  // Calculate total
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
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
