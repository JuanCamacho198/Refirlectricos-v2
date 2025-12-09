export interface Specification {
  label: string;
  value: string;
}

// Variant attributes stored as JSON: { "potencia": "1/4 HP", "voltaje": "110V" }
export interface VariantAttributes {
  [key: string]: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  slug: string;
  name: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image_url: string | null;
  images_url?: string[];
  isDefault: boolean;
  isActive: boolean;
  position: number;
  attributes?: VariantAttributes;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice?: number | null;
  promoLabel?: string | null;
  stock: number;
  image_url: string | null;
  images_url: string[];
  category: string;
  subcategory: string | null;
  brand: string | null;
  sku: string | null;
  tags: string[];
  specifications: Specification[] | null;
  isActive: boolean;
  hasVariants?: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
}

// Product with variant info from API when fetching by variant slug
export interface ProductWithVariant extends Product {
  selectedVariant?: ProductVariant;
}
