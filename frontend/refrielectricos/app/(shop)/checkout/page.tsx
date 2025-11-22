'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useAddresses } from '@/hooks/useAddresses';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import AddressForm from '@/components/features/profile/addresses/AddressForm';
import { MapPin, CreditCard, Loader2, Plus, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addresses, loading: addressesLoading, createAddress } = useAddresses();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD' | 'NEQUI'>('COD');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  // Seleccionar dirección por defecto
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!selectedAddressId) {
      setError('Por favor selecciona una dirección de envío');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    console.log('Iniciando proceso de orden...');
    setLoading(true);
    setError('');

    try {
      // Simular procesamiento de pago si no es contra entrega
      if (paymentMethod !== 'COD') {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos de "procesamiento"
      }

      const orderData = {
        userId: user.id,
        addressId: selectedAddressId,
        notes: notes,
        status: paymentMethod === 'COD' ? 'PENDING' : 'PAID', // Simulación: Pagado si es electrónico
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      };

      console.log('Enviando datos de orden:', orderData);
      const response = await api.post('/orders', orderData);
      console.log('Respuesta del servidor:', response);
      
      clearCart();
      router.push('/checkout/success');
    } catch (err: unknown) {
      console.error('Error al crear la orden:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      const errorMessage = error.response?.data?.message || error.message || 'Error al procesar la orden';
      setError(errorMessage);
      // Scroll al error para que el usuario lo vea
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulario de Envío y Pago */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Sección Dirección */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MapPin className="text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Dirección de Envío</h2>
              </div>
              {!isAddingAddress && (
                <button 
                  onClick={() => setIsAddingAddress(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Plus size={16} /> Nueva
                </button>
              )}
            </div>
            
            {isAddingAddress ? (
              <AddressForm 
                onSubmit={async (data) => {
                  const success = await createAddress(data);
                  if (success) setIsAddingAddress(false);
                }}
                onCancel={() => setIsAddingAddress(false)}
                isLoading={addressesLoading}
              />
            ) : (
              <div className="space-y-4">
                {addressesLoading && addresses.length === 0 ? (
                   <div className="text-center py-4 text-gray-500">Cargando direcciones...</div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="text-gray-500 mb-4">No tienes direcciones guardadas</p>
                    <Button onClick={() => setIsAddingAddress(true)}>Agregar Dirección</Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {addresses.map(addr => (
                      <div 
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                          selectedAddressId === addr.id 
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 h-5 w-5 shrink-0 rounded-full border flex items-center justify-center ${
                            selectedAddressId === addr.id 
                              ? 'border-blue-600 bg-blue-600 text-white' 
                              : 'border-gray-400'
                          }`}>
                            {selectedAddressId === addr.id && <CheckCircle size={12} />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{addr.addressLine1}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {addr.addressLine2 && `${addr.addressLine2}, `}{addr.city}, {addr.state}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{addr.fullName} - {addr.phone}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isAddingAddress && (
              <div className="mt-6">
                <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                  Notas adicionales (Opcional)
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-white dark:bg-gray-800 sm:text-sm sm:leading-6 px-3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instrucciones especiales para la entrega..."
                />
              </div>
            )}
          </div>

          {/* Sección Pago (Simulada) */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Método de Pago</h2>
            </div>
            
            <div className="space-y-3">
              <div 
                onClick={() => setPaymentMethod('COD')}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'COD' 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-600' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <input
                  id="payment-cod"
                  name="payment-method"
                  type="radio"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="payment-cod" className="ml-3 block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                  Pago contra entrega (Efectivo)
                </label>
              </div>

              <div 
                onClick={() => setPaymentMethod('CARD')}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'CARD' 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-600' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <input
                  id="payment-card"
                  name="payment-method"
                  type="radio"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
                <div className="ml-3">
                  <label htmlFor="payment-card" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                    Tarjeta de Crédito / Débito
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Procesado seguro por Stripe (Simulado)</p>
                </div>
              </div>

              <div 
                onClick={() => setPaymentMethod('NEQUI')}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'NEQUI' 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-600' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <input
                  id="payment-nequi"
                  name="payment-method"
                  type="radio"
                  checked={paymentMethod === 'NEQUI'}
                  onChange={() => setPaymentMethod('NEQUI')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
                <div className="ml-3">
                  <label htmlFor="payment-nequi" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                    Nequi / Daviplata
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Transferencia rápida (Simulado)</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Resumen de Orden */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Resumen del Pedido</h2>
            
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 mb-6 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="py-4 flex gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 relative">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-contain object-center bg-white dark:bg-gray-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-400">Sin img</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{item.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cant: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ${(item.price * item.quantity).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Envío</span>
                <span>$0 (Gratis)</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                <span>Total a pagar</span>
                <span className="text-blue-600 dark:text-blue-400">${totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              onClick={handlePlaceOrder}
              className="w-full mt-6"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar Pedido'
              )}
            </Button>
            
            <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
              Al confirmar, aceptas nuestros términos y condiciones.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
