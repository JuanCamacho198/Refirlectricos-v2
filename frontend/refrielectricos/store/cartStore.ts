import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant } from '@/types/product';

export interface CartItem {
  id: string; // Product ID
  variantId?: string; // Variant ID (optional)
  quantity: number;
  product: Product;
  variant?: ProductVariant; // Variant data (optional)
}

// Generate unique key for cart items (product + variant combination)
const getCartItemKey = (productId: string, variantId?: string) => 
  variantId ? `${productId}-${variantId}` : productId;

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  toggleCart: () => void;
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

        if (existingItem) {
          set({
            items: items.map((item) =>
              getCartItemKey(item.id, item.variantId) === itemKey
                ? { ...item, quantity: item.quantity + quantity }
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
        const itemKey = getCartItemKey(productId, variantId);
        set({
          items: get().items.map((item) =>
            getCartItemKey(item.id, item.variantId) === itemKey
              ? { ...item, quantity }
              : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      setItems: (items) => set({ items }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
