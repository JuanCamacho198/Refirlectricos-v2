import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useCartStore, CartItem } from '@/store/cartStore';
import api from '@/lib/api';
import { useEffect } from 'react';
import { Product, ProductVariant } from '@/types/product';
import { useToast, ToastType } from '@/context/ToastContext';

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

const getAvailableStock = (product: Product, variant?: ProductVariant): number => {
  return variant?.stock ?? product.stock;
};

export const useCart = () => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const setItems = useCartStore((state) => state.setItems);
  const localAddItem = useCartStore((state) => state.addItem);
  const localRemoveItem = useCartStore((state) => state.removeItem);
  const localUpdateQuantity = useCartStore((state) => state.updateQuantity);
  const localClearCart = useCartStore((state) => state.clearCart);

  const queryClient = useQueryClient();

  const { data: dbCart } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get('/cart');
      return data;
    },
    enabled: isAuthenticated,
  });

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

  const showToast = (title: string, type: ToastType = 'info') => {
    addToast(title, type);
  };

  const checkStockBeforeAdd = (product: Product, quantity: number, variant?: ProductVariant): boolean => {
    const availableStock = getAvailableStock(product, variant);

    if (availableStock <= 0) {
      showToast(`${product.name} está fuera de stock`, 'error');
      return false;
    }

    const existingItem = items.find(
      (item) => item.id === product.id && item.variantId === variant?.id
    );

    const currentQuantity = existingItem ? existingItem.quantity : 0;
    if (currentQuantity + quantity > availableStock) {
      showToast(`Solo hay ${availableStock} unidades disponibles de ${product.name}`, 'warning');
      return false;
    }

    return true;
  };

  const addToCartMutation = useMutation({
    mutationFn: async ({ product, quantity, variant }: { product: Product, quantity: number, variant?: ProductVariant }) => {
      const availableStock = getAvailableStock(product, variant);
      if (availableStock <= 0) {
        throw new Error('OUT_OF_STOCK');
      }
      if (quantity > availableStock) {
        throw new Error('INSUFFICIENT_STOCK');
      }
      return api.post('/cart/items', { productId: product.id, variantId: variant?.id, quantity });
    },
    onMutate: async ({ product, quantity, variant }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartApiData>(['cart']);

      localAddItem(product, quantity, variant);

      queryClient.setQueryData<CartApiData>(['cart'], (old) => {
        if (!old) return old;
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
    onError: (err: Error, variables, context) => {
      if (err.message === 'OUT_OF_STOCK') {
        showToast(`${variables.product.name} está fuera de stock`, 'error');
      } else if (err.message === 'INSUFFICIENT_STOCK') {
        const availableStock = getAvailableStock(variables.product, variables.variant);
        showToast(`Solo hay ${availableStock} unidades disponibles de ${variables.product.name}`, 'warning');
      }

      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
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

      const success = localUpdateQuantity(productId, quantity, variantId);
      if (!success) {
        const item = items.find((i) => i.id === productId && i.variantId === variantId);
        if (item) {
          const availableStock = getAvailableStock(item.product, item.variant);
          showToast(`Solo hay ${availableStock} unidades disponibles`, 'warning');
        }
        throw new Error('STOCK_ERROR');
      }

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
    onError: (err: Error, variables, context) => {
      if (err.message !== 'STOCK_ERROR') {
        if (context?.previousCart) {
          queryClient.setQueryData(['cart'], context.previousCart);
          const mappedItems = context.previousCart.items.map((item) => ({
            id: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            product: item.product,
            variant: item.variant,
          }));
          setItems(mappedItems);
        }
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

  const mergeCartMutation = useMutation({
    mutationFn: async (items: { productId: string, quantity: number }[]) => {
      return api.post('/cart/merge', items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const addItem = (product: Product, quantity = 1, variant?: ProductVariant) => {
    if (isAuthenticated) {
      if (checkStockBeforeAdd(product, quantity, variant)) {
        addToCartMutation.mutate({ product, quantity, variant });
      }
    } else {
      const success = localAddItem(product, quantity, variant);
      if (!success) {
        const availableStock = getAvailableStock(product, variant);
        if (availableStock <= 0) {
          showToast(`${product.name} está fuera de stock`, 'error');
        } else {
          showToast(`Solo hay ${availableStock} unidades disponibles de ${product.name}`, 'warning');
        }
      }
    }
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (isAuthenticated) {
      updateQuantityMutation.mutate({ productId, quantity, variantId });
    } else {
      const success = localUpdateQuantity(productId, quantity, variantId);
      if (!success) {
        const item = items.find((i) => i.id === productId && i.variantId === variantId);
        if (item) {
          const availableStock = getAvailableStock(item.product, item.variant);
          showToast(`Solo hay ${availableStock} unidades disponibles`, 'warning');
        }
      }
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

  const outOfStockItems: CartItem[] = items.filter((item) => {
    const availableStock = getAvailableStock(item.product, item.variant);
    return availableStock <= 0;
  });

  const hasOutOfStockItems = outOfStockItems.length > 0;

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
    outOfStockItems,
    hasOutOfStockItems,
    isLoading: isAuthenticated && !dbCart,
  };
};
