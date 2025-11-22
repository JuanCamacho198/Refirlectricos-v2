'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Calendar, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types/order';
import Button from '@/components/ui/Button';

export default function OrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const response = await api.get('/orders/mine');
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('No se pudieron cargar tus pedidos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No tienes pedidos aún</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          ¿Qué esperas para estrenar? Explora nuestro catálogo.
        </p>
        <Link href="/products" className="mt-6 inline-block">
          <Button>Ver Productos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Link 
          href={`/profile/orders/${order.id}`}
          key={order.id} 
          className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md group"
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Calendar size={14} />
                  {new Date(order.createdAt).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  Pedido #{order.id.slice(-6).toUpperCase()}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  getStatusColor(order.status)
                }`}>
                  {translateStatus(order.status)}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ${order.total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="space-y-3">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.quantity}x
                      </span>
                      <span className="text-gray-600 dark:text-gray-300 truncate max-w-[200px] sm:max-w-xs">
                        {item.product.name}
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-gray-400 italic pt-1">
                    + {order.items.length - 3} productos más...
                  </p>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    case 'PAID':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    case 'SHIPPED':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
    case 'DELIVERED': // Assuming DELIVERED might exist in future
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  }
}

function translateStatus(status: string) {
  const map: Record<string, string> = {
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  };
  return map[status] || status;
}
