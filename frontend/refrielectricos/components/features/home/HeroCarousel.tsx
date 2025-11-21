'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
//import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';

const slides = [
  {
    id: 1,
    title: "Repuestos de Refrigeración",
    subtitle: "La mejor calidad para tus reparaciones",
    description: "Encuentra compresores, termostatos, gases refrigerantes y más.",
    image: "/images/hero-1.jpg", // Placeholder path
    color: "bg-blue-600",
    link: "/products?category=Refrigeración"
  },
  {
    id: 2,
    title: "Herramientas Profesionales",
    subtitle: "Equípate con lo mejor",
    description: "Bombas de vacío, manómetros y herramientas especializadas.",
    image: "/images/hero-2.jpg",
    color: "bg-cyan-600",
    link: "/products?category=Herramientas"
  },
  {
    id: 3,
    title: "Ofertas Especiales",
    subtitle: "Precios increíbles por tiempo limitado",
    description: "Aprovecha nuestros descuentos en productos seleccionados.",
    image: "/images/hero-3.jpg",
    color: "bg-indigo-600",
    link: "/products?sort=price_asc"
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
  const next = () => setCurrent((curr) => (curr === slides.length - 1 ? 0 : curr + 1));

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-2xl shadow-lg group">
      {/* Slides */}
      <div 
        className="flex transition-transform duration-500 ease-out h-full" 
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className={`w-full h-full shrink-0 relative ${slide.color} flex items-center`}>
            {/* Background Pattern/Image Placeholder */}
            <div className="absolute inset-0 opacity-20 bg-[url('/patterns/circuit.svg')] bg-repeat"></div>
            <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full">
              <div className="max-w-lg text-white space-y-6 animate-in slide-in-from-left duration-700 fade-in">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                  {slide.subtitle}
                </span>
                <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl text-gray-100">
                  {slide.description}
                </p>
                <Link href={slide.link}>
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 border-none">
                    Ver Productos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button 
        onClick={prev} 
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={next} 
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              current === i ? "bg-white w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
