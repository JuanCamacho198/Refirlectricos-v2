import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Address, CreateAddressDto, UpdateAddressDto } from '@/types/address';
import { useToast } from '@/context/ToastContext';

interface UseAddressesOptions {
  enabled?: boolean;
}

export function useAddresses(options: UseAddressesOptions = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: addresses = [], isLoading: loading, isError } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await api.get<Address[]>('/addresses');
      return data;
    },
    enabled,
  });

  const createAddressMutation = useMutation({
    mutationFn: async (data: CreateAddressDto) => {
      const { data: newAddress } = await api.post<Address>('/addresses', data);
      return newAddress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      addToast('Dirección agregada', 'success');
    },
    onError: (error) => {
      console.error('Error creating address:', error);
      addToast('Error al crear dirección', 'error');
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAddressDto }) => {
      const { data: updatedAddress } = await api.patch<Address>(`/addresses/${id}`, data);
      return updatedAddress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      addToast('Dirección actualizada', 'success');
    },
    onError: (error) => {
      console.error('Error updating address:', error);
      addToast('Error al actualizar dirección', 'error');
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      addToast('Dirección eliminada', 'info');
    },
    onError: (error) => {
      console.error('Error deleting address:', error);
      addToast('Error al eliminar dirección', 'error');
    },
  });

  return {
    createAddress: createAddressMutation.mutateAsync,
    deleteAddress: deleteAddressMutation.mutateAsync,
    updateAddress: (id: string, data: UpdateAddressDto) => updateAddressMutation.mutateAsync({ id, data }),
    addresses,
    loading,
    isError,
    isCreating: createAddressMutation.isPending,
    isUpdating: updateAddressMutation.isPending,
    isDeleting: deleteAddressMutation.isPending,
  };
}
