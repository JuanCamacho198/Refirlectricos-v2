import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Order } from '@/types/order';

export interface CreateOrderDto {
  userId: string;
  addressId: string;
  notes?: string;
  status: 'PENDING' | 'PAID';
  items: {
    productId: string;
    quantity: number;
  }[];
}

interface UseOrdersOptions {
  enabled?: boolean;
}

export const useOrders = (options: UseOrdersOptions = {}) => {
  const { enabled = true } = options;
  
  return useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: async () => {
      const { data } = await api.get<Order[]>('/orders/mine');
      return data;
    },
    enabled,
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get<Order>(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderDto) => {
      const { data } = await api.post<Order>('/orders', orderData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
