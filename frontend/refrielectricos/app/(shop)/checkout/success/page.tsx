'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CheckoutSuccessPage() {
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
