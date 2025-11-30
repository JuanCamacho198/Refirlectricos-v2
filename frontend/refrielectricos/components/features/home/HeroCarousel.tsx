'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    if (newDirection === 1) {
      setCurrent((curr) => (curr === slides.length - 1 ? 0 : curr + 1));
    } else {
      setCurrent((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
    }
  };

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 5000);
    return () => clearInterval(timer);
  }, [current]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-2xl shadow-lg group bg-gray-900">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className={`absolute inset-0 w-full h-full ${slides[current].color} flex items-center`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[url('/patterns/circuit.svg')] bg-repeat"></div>
          <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full">
            <div className="max-w-lg text-white space-y-6">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30"
              >
                {slides[current].subtitle}
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-bold leading-tight"
              >
                {slides[current].title}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-gray-100"
              >
                {slides[current].description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link href={slides[current].link}>
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 border-none">
                    Ver Productos
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button 
        onClick={() => paginate(-1)} 
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100 z-20"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={() => paginate(1)} 
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100 z-20"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              current === i ? "bg-white w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
