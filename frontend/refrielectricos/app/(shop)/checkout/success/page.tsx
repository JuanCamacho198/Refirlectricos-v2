'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface OrderStatus {
  orderId: string;
  status: string;
  paymentStatus: string;
  total: number;
  paymentReference?: string;
  paymentMethod?: string;
  createdAt: string;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderStatus = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/payments/order-status/${orderId}`);
        setOrderStatus(response.data);
      } catch (err) {
        console.error('Error fetching order status:', err);
        setError('No pudimos obtener el estado de tu pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();

    // Poll for status updates (ePayco webhook might be delayed)
    const interval = setInterval(fetchOrderStatus, 5000);
    
    // Stop polling after 30 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [orderId]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center mt-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
          <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verificando tu pago...</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Estamos confirmando el estado de tu transacción.
        </p>
      </div>
    );
  }

  // No orderId provided - generic success (for COD orders)
  if (!orderId) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center mt-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Pedido Confirmado!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Gracias por tu compra. Hemos recibido tu pedido y pronto nos pondremos en contacto contigo para coordinar la entrega.
        </p>

        <div className="space-y-3">
          <Link href="/profile/orders" className="block w-full">
            <Button variant="outline" className="w-full">Ver mis pedidos</Button>
          </Link>
          <Link href="/products" className="block w-full">
            <Button className="w-full">Seguir comprando</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Error fetching order
  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center mt-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6">
          <AlertTriangle className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Estado Desconocido</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Referencia del pedido: <span className="font-mono">{orderId}</span>
        </p>

        <div className="space-y-3">
          <Link href="/profile/orders" className="block w-full">
            <Button variant="outline" className="w-full">Ver mis pedidos</Button>
          </Link>
          <Link href="/products" className="block w-full">
            <Button className="w-full">Seguir comprando</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Render based on payment status
  const { status, paymentStatus, total, paymentReference, paymentMethod } = orderStatus!;
  
  // Success - Payment approved
  if (status === 'PAID' || paymentStatus === 'COMPLETED') {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center mt-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Pago Exitoso!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Tu pago ha sido procesado correctamente. Gracias por tu compra.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Pedido:</span>
            <span className="font-mono text-gray-900 dark:text-white">{orderId.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Total pagado:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(total)}</span>
          </div>
          {paymentReference && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Referencia:</span>
              <span className="font-mono text-gray-900 dark:text-white">{paymentReference}</span>
            </div>
          )}
          {paymentMethod && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Método:</span>
              <span className="text-gray-900 dark:text-white">{paymentMethod}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link href="/profile/orders" className="block w-full">
            <Button variant="outline" className="w-full">Ver mis pedidos</Button>
          </Link>
          <Link href="/products" className="block w-full">
            <Button className="w-full">Seguir comprando</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Pending payment
  if (status === 'PENDING' || paymentStatus === 'PENDING') {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center mt-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6">
          <Clock className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pago Pendiente</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Tu pago está siendo procesado. Te notificaremos cuando se confirme.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Pedido:</span>
            <span className="font-mono text-gray-900 dark:text-white">{orderId.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Total:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Estado:</span>
            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
              {paymentStatus || 'Pendiente'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/profile/orders" className="block w-full">
            <Button variant="outline" className="w-full">Ver mis pedidos</Button>
          </Link>
          <Link href="/products" className="block w-full">
            <Button className="w-full">Seguir comprando</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Failed/Rejected payment
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center mt-8">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
        <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pago No Procesado</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Lo sentimos, no pudimos procesar tu pago. Por favor intenta nuevamente o usa otro método de pago.
      </p>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 text-left space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Pedido:</span>
          <span className="font-mono text-gray-900 dark:text-white">{orderId.slice(-8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Estado:</span>
          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
            {paymentStatus || status}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/cart" className="block w-full">
          <Button className="w-full">Volver al carrito</Button>
        </Link>
        <Link href="/products" className="block w-full">
          <Button variant="outline" className="w-full">Seguir comprando</Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center mt-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
          <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cargando...</h1>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
