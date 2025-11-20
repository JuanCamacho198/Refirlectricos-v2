'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, User, MapPin } from 'lucide-react';
import api from '@/lib/api';
import Image from 'next/image';
import { Order } from '@/types/order';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${params.id}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  if (isLoading) return <div>Cargando pedido...</div>;
  if (!order) return <div>Pedido no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders" className="text-gray-500 hover:text-blue-600">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Pedido #{order.id.slice(-6).toUpperCase()}
        </h1>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800">
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Package className="text-blue-600" />
              Productos
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                  <div className="h-16 w-16 relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                     {item.product.image_url ? (
                        <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs">Sin img</div>
                      )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">${item.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Total: ${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="font-medium text-gray-900 dark:text-white">Total Pedido</span>
              <span className="text-xl font-bold text-blue-600">${order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <User className="text-blue-600" />
              Cliente
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Nombre</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.user.name || 'Sin nombre'}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.user.email}</p>
              </div>
              <div>
                <p className="text-gray-500">ID Usuario</p>
                <p className="font-mono text-xs text-gray-400">{order.userId}</p>
              </div>
            </div>
          </div>

          {/* Shipping Info (Placeholder as we don't save address in Order model yet) */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 opacity-50">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <MapPin className="text-blue-600" />
              Envío
            </h2>
            <p className="text-sm text-gray-500 italic">
              La dirección de envío no se está guardando en la base de datos todavía. 
              (Se implementará en la siguiente fase de backend).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
