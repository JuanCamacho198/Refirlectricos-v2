export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url?: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
  createdAt: string;
  items: OrderItem[];
  user: {
    name: string | null;
    email: string;
  };
}
