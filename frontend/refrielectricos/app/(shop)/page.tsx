'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import HeroCarousel from '@/components/features/home/HeroCarousel';
import FeaturesSection from '@/components/features/home/FeaturesSection';
import ProductCarousel from '@/components/features/home/ProductCarousel';
import CategoriesGrid from '@/components/features/home/CategoriesGrid';
import Button from '@/components/ui/Button';
import { Mail } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category?: string;
  brand?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <HeroCarousel />

      {/* Features (Envío gratis, etc) */}
      <FeaturesSection />

      {/* Categorías */}
      <CategoriesGrid />

      {/* Productos Destacados (Carousel) */}
      {loading ? (
        <div className="py-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-6 animate-pulse" />
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[280px] h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <ProductCarousel title="Productos Destacados" products={products} />
      )}

      {/* Banner Promocional */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-r from-blue-900 to-blue-600 text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg my-12">
        <div className="absolute inset-0 opacity-10 bg-[url('/patterns/circuit.svg')]"></div>
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl font-bold mb-4">¿Eres técnico profesional?</h2>
          <p className="text-blue-100 text-lg mb-6">
            Regístrate como técnico y obtén precios especiales, acceso a manuales técnicos y soporte prioritario.
          </p>
          <Button className="bg-white text-blue-900 hover:bg-blue-50 border-none">
            Registrarme como Técnico
          </Button>
        </div>
        <div className="relative z-10 hidden md:block">
          {/* Aquí podría ir una imagen ilustrativa */}
          <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
            <span className="text-4xl">🛠️</span>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 md:p-12 text-center border border-gray-100 dark:border-gray-700">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-6">
            <Mail size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Suscríbete a nuestro boletín
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Recibe las últimas novedades, ofertas exclusivas y consejos de mantenimiento directamente en tu correo.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Tu correo electrónico" 
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <Button type="submit">Suscribirse</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

