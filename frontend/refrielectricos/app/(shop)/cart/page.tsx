'use client';

import { useCart } from '@/context/CartContext';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Parece que aún no has añadido productos.</p>
          <Link href="/">
            <Button>Volver a la tienda</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Carrito de Compras</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item) => (
                  <li key={item.id} className="p-6 flex items-center">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-contain object-center bg-white dark:bg-gray-700"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                          <h3>{item.name}</h3>
                          <p className="ml-4">${(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resumen del pedido</h2>
              <div className="flow-root">
                <dl className="-my-4 divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="py-4 flex items-center justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Subtotal</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">${totalPrice.toLocaleString()}</dd>
                  </div>
                  <div className="py-4 flex items-center justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Envío</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">Calculado en el siguiente paso</dd>
                  </div>
                  <div className="py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                    <dt className="text-base font-bold text-gray-900 dark:text-white">Total</dt>
                    <dd className="text-base font-bold text-blue-600 dark:text-blue-400">${totalPrice.toLocaleString()}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6">
                <Link href="/checkout">
                  <Button className="w-full">
                    Proceder al pago
                  </Button>
                </Link>
              </div>
              <div className="mt-4">
                <button 
                  onClick={clearCart}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
