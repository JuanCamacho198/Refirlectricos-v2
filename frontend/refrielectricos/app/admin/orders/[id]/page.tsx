'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, User, MapPin, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import Image from 'next/image';
import { Order } from '@/types/order';
import { useToast } from '@/context/ToastContext';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const { addToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const res = await api.patch(`/orders/${order.id}`, { status: newStatus });
      setOrder(res.data);
      addToast('Estado actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      addToast('Error al actualizar estado', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div>Cargando pedido...</div>;
  if (!order) return <div>Pedido no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="text-gray-500 hover:text-blue-600">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pedido #{order.id.slice(-6).toUpperCase()}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
            {isUpdating && <Loader2 className="animate-spin text-blue-600" size={20} />}
            <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                className={`px-4 py-2 rounded-lg border text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
                    getStatusColor(order.status)
                }`}
            >
                <option value="PENDING">Pendiente</option>
                <option value="PAID">Pagado</option>
                <option value="SHIPPED">Enviado</option>
                <option value="DELIVERED">Entregado</option>
                <option value="CANCELLED">Cancelado</option>
            </select>
        </div>
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

          {/* Shipping Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <MapPin className="text-blue-600" />
              Envío
            </h2>
            {order.shippingAddress ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Destinatario</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.shippingName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Teléfono</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.shippingPhone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Dirección</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.shippingAddress}</p>
                  <p className="text-gray-600 dark:text-gray-400">{order.shippingCity}, {order.shippingState}</p>
                </div>
                {order.shippingNotes && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                    <p className="text-gray-500">Notas</p>
                    <p className="italic text-gray-700 dark:text-gray-300">{order.shippingNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Sin información de envío (Orden antigua o incompleta).
              </p>
            )}
          </div>
        </div>
      </div>
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
    case 'DELIVERED':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  }
}
