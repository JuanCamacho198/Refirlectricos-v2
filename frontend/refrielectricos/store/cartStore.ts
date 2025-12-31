import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant } from '@/types/product';

export interface CartItem {
  id: string;
  variantId?: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
}

const getCartItemKey = (productId: string, variantId?: string) =>
  variantId ? `${productId}-${variantId}` : productId;

const getAvailableStock = (product: Product, variant?: ProductVariant): number => {
  return variant?.stock ?? product.stock;
};

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => boolean;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => boolean;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  toggleCart: () => void;
  getOutOfStockItems: () => CartItem[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1, variant) => {
        const items = get().items;
        const itemKey = getCartItemKey(product.id, variant?.id);
        const existingItem = items.find(
          (item) => getCartItemKey(item.id, item.variantId) === itemKey
        );

        const availableStock = getAvailableStock(product, variant);

        if (availableStock <= 0) {
          return false;
        }

        const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

        if (newQuantity > availableStock) {
          return false;
        }

        if (existingItem) {
          set({
            items: items.map((item) =>
              getCartItemKey(item.id, item.variantId) === itemKey
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              { id: product.id, variantId: variant?.id, quantity, product, variant },
            ],
          });
        }
        return true;
      },
      removeItem: (productId, variantId) => {
        const itemKey = getCartItemKey(productId, variantId);
        set({
          items: get().items.filter(
            (item) => getCartItemKey(item.id, item.variantId) !== itemKey
          ),
        });
      },
      updateQuantity: (productId, quantity, variantId) => {
        const items = get().items;
        const itemKey = getCartItemKey(productId, variantId);
        const existingItem = items.find(
          (item) => getCartItemKey(item.id, item.variantId) === itemKey
        );

        if (!existingItem) {
          return false;
        }

        const availableStock = getAvailableStock(existingItem.product, existingItem.variant);

        if (quantity > availableStock) {
          return false;
        }

        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return true;
        }

        set({
          items: items.map((item) =>
            getCartItemKey(item.id, item.variantId) === itemKey
              ? { ...item, quantity }
              : item
          ),
        });
        return true;
      },
      clearCart: () => set({ items: [] }),
      setItems: (items) => set({ items }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      getOutOfStockItems: () => {
        return get().items.filter((item) => {
          const availableStock = getAvailableStock(item.product, item.variant);
          return availableStock <= 0;
        });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
