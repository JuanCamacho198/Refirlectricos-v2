'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { MapPin, CreditCard, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Formulario de envío (Simulado por ahora, ya que el backend no guarda dirección en Order aún)
  const [shippingData, setShippingData] = useState({
    address: '',
    city: '',
    phone: '',
    notes: ''
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      const orderData = {
        userId: user.id,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      };

      await api.post('/orders', orderData);
      
      clearCart();
      router.push('/checkout/success');
    } catch (err: unknown) {
      console.error(err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      setError(error.response?.data?.message || 'Error al procesar la orden');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulario de Envío y Pago */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Sección Dirección */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Información de Envío</h2>
              </div>
              
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Ciudad"
                    name="city"
                    required
                    value={shippingData.city}
                    onChange={handleInputChange}
                    placeholder="Bogotá, Medellín..."
                  />
                  <Input
                    label="Teléfono"
                    name="phone"
                    required
                    value={shippingData.phone}
                    onChange={handleInputChange}
                    placeholder="300 123 4567"
                  />
                </div>
                <Input
                  label="Dirección de entrega"
                  name="address"
                  required
                  value={shippingData.address}
                  onChange={handleInputChange}
                  placeholder="Calle 123 # 45 - 67"
                />
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                    Notas adicionales (Opcional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-white dark:bg-gray-800 sm:text-sm sm:leading-6 px-3"
                    value={shippingData.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </form>
            </div>

            {/* Sección Pago (Simulada) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Método de Pago</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer">
                  <input
                    id="payment-cod"
                    name="payment-method"
                    type="radio"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="payment-cod" className="ml-3 block text-sm font-medium text-gray-900 dark:text-white">
                    Pago contra entrega (Efectivo)
                  </label>
                </div>
                <div className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg opacity-60 cursor-not-allowed">
                  <input
                    id="payment-card"
                    name="payment-method"
                    type="radio"
                    disabled
                    className="h-4 w-4 text-gray-300 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="payment-card" className="ml-3 block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tarjeta de Crédito / Débito (Próximamente)
                  </label>
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
                form="checkout-form"
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
      </main>
    </div>
  );
}
