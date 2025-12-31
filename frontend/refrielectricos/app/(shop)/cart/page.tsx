'use client';

import { useCart } from '@/hooks/useCart';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart, outOfStockItems, hasOutOfStockItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Parece que aún no has añadido productos.</p>
        <Link href="/">
          <Button>Volver a la tienda</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Carrito de Compras</h1>

      {hasOutOfStockItems && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-200">
                Algunos productos están fuera de stock
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Los productos marcados no están disponibles actualmente. Puedes eliminarlos para continuar con tu compra.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => {
                const availableStock = item.variant?.stock ?? item.product.stock;
                const isOutOfStock = availableStock <= 0;

                return (
                  <li key={item.id} className={`p-6 flex items-center ${isOutOfStock ? 'bg-gray-50 dark:bg-gray-900/50' : ''}`}>
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
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
                          <h3 className={isOutOfStock ? 'text-gray-500 dark:text-gray-400' : ''}>{item.product.name}</h3>
                          <p className={`ml-4 ${isOutOfStock ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                            {formatCurrency((item.variant?.price ?? item.product.price) * item.quantity)}
                          </p>
                        </div>
                        {isOutOfStock && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            Producto fuera de stock
                          </p>
                        )}
                        {!isOutOfStock && availableStock < 5 && (
                          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                            Solo quedan {availableStock} unidades
                          </p>
                        )}
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50"
                            disabled={item.quantity <= 1 || isOutOfStock}
                          >
                            <Minus size={16} />
                          </button>
                          <span className={`px-4 font-medium ${isOutOfStock ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50"
                            disabled={isOutOfStock || item.quantity >= availableStock}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id, item.variantId)}
                          className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
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
                  <dd className="font-medium text-gray-900 dark:text-white">{formatCurrency(totalPrice)}</dd>
                </div>
                <div className="py-4 flex items-center justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Envío</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">Calculado en el siguiente paso</dd>
                </div>
                <div className="py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                  <dt className="text-base font-bold text-gray-900 dark:text-white">Total</dt>
                  <dd className="text-base font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalPrice)}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6">
              <Link href={hasOutOfStockItems ? '#' : '/checkout'}>
                <Button
                  className="w-full"
                  disabled={hasOutOfStockItems}
                >
                  Proceder al pago
                </Button>
              </Link>
              {hasOutOfStockItems && (
                <p className="text-sm text-amber-600 dark:text-amber-400 text-center mt-2">
                  Elimina los productos fuera de stock para continuar
                </p>
              )}
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
    </>
  );
}
