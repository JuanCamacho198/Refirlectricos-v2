'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Navbar from '@/components/layout/Navbar';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Pedido Confirmado!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Gracias por tu compra. Hemos recibido tu pedido y pronto nos pondremos en contacto contigo para coordinar la entrega.
          </p>

          <div className="space-y-3">
            <Link href="/products" className="block w-full">
              <Button className="w-full">Seguir comprando</Button>
            </Link>
            <Link href="/" className="block w-full">
              <Button variant="outline" className="w-full">Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
