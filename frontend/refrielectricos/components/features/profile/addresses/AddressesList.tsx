'use client';

import { useState } from 'react';
import { Plus, MapPin, Trash2, CheckCircle } from 'lucide-react';
import AddressForm from '@/components/features/profile/addresses/AddressForm';
import { useAddresses } from '@/hooks/useAddresses';
import { CreateAddressDto } from '@/types/address';

interface AddressesListProps {
  enabled?: boolean;
}

export default function AddressesList({ enabled = true }: AddressesListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addresses, loading, createAddress, deleteAddress } = useAddresses({ enabled });

  const handleAddAddress = async (data: CreateAddressDto) => {
    const success = await createAddress(data);
    if (success) {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta dirección?')) {
      await deleteAddress(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isAdding ? 'Nueva Dirección' : 'Mis Direcciones'}
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Agregar Nueva
          </button>
        )}
      </div>

      {isAdding ? (
        <AddressForm 
          onSubmit={handleAddAddress}
          onCancel={() => setIsAdding(false)}
          isLoading={loading}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading && addresses.length === 0 ? (
             <div className="col-span-full text-center py-12">
               <p className="text-gray-500">Cargando direcciones...</p>
             </div>
          ) : addresses.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tienes direcciones</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Agrega una dirección para tus envíos.</p>
            </div>
          ) : (
            addresses.map((address) => (
              <div 
                key={address.id} 
                className={`relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-colors group ${
                  address.isDefault 
                    ? 'border-blue-500 ring-1 ring-blue-500' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {address.isDefault && (
                      <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                        <CheckCircle size={12} />
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar dirección"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  {address.addressLine1}
                </h3>
                {address.addressLine2 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {address.addressLine2}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {address.city}, {address.state}
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Recibe:</span> {address.fullName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Tel:</span> {address.phone}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
