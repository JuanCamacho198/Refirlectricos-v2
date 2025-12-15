'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, ShoppingCart, Star } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function StageHero() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set(clientX - left - width / 2);
    y.set(clientY - top - height / 2);
  }

  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  return (
    <div 
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-neutral-950 text-white perspective-1000 -mt-8 -mx-4 md:-mx-8 mb-12 rounded-b-[3rem]"
      onMouseMove={onMouseMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {/* Background Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)]" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-5" />

      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            <Star className="w-4 h-4 fill-blue-400" />
            <span>Producto Destacado del Mes</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Compresor <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300">
              Inverter Pro
            </span>
          </h1>
          
          <p className="text-lg text-gray-400 max-w-lg">
            Máxima eficiencia energética para tu sistema de refrigeración. 
            Tecnología silenciosa y duradera con 10 años de garantía.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-blue-900/20">
              Comprar Ahora <ShoppingCart className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-6 text-lg rounded-full">
              Ver Detalles <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-8 pt-8 border-t border-gray-800">
            <div>
              <p className="text-3xl font-bold text-white">$1,299</p>
              <p className="text-sm text-gray-500">Precio de lista</p>
            </div>
            <div className="h-10 w-px bg-gray-800" />
            <div>
              <p className="text-3xl font-bold text-green-400">-15%</p>
              <p className="text-sm text-gray-500">Descuento</p>
            </div>
          </div>
        </motion.div>

        {/* 3D Product Stage */}
        <div className="relative flex items-center justify-center perspective-1000">
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative w-full max-w-md aspect-square"
          >
            {/* Floating Elements behind */}
            <motion.div 
              className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl" 
            />
            
            {/* Main Product Image */}
            <motion.div
              className="relative z-10 drop-shadow-2xl"
            >
               {/* Using the site logo asset */}
               <div className="relative w-full h-full flex items-center justify-center">
                  <Image 
                    src="/images/RefriLogo.png" 
                    alt="Refrielectricos Logo" 
                    width={500} 
                    height={500}
                    className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  />
               </div>
            </motion.div>

            {/* Floating Specs Cards */}
            <motion.div
              className="absolute -right-4 top-10 bg-gray-900/80 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 font-bold">A++</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Eficiencia</p>
                  <p className="font-bold text-white">Energy Saver</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -left-8 bottom-20 bg-gray-900/80 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 font-bold">24h</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Envío</p>
                  <p className="font-bold text-white">Entrega Rápida</p>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
