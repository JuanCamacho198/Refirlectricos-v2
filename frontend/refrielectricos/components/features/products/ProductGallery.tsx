'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const zoomRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const mainImage = images[mainImageIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomRef.current || !containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    
    zoomRef.current.style.transformOrigin = `${x}% ${y}%`;
    zoomRef.current.style.transform = "scale(2)";
  };

  const handleMouseLeave = () => {
    if (!zoomRef.current) return;
    zoomRef.current.style.transformOrigin = "center center";
    zoomRef.current.style.transform = "scale(1)";
  };

  const nextImage = () => {
    setMainImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setMainImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
     return (
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600">
            Sin imagen
        </div>
     )
  }

  return (
    <div className="space-y-4">
      <div 
        ref={containerRef}
        className="relative aspect-square bg-white dark:bg-gray-700 rounded-lg overflow-hidden cursor-zoom-in border border-gray-200 dark:border-gray-600 group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          ref={zoomRef}
          src={mainImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain transition-transform duration-200 ease-out"
        />
        
        {images.length > 1 && (
            <>
                <button 
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-white"
                    aria-label="Anterior imagen"
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-white"
                    aria-label="Siguiente imagen"
                >
                    <ChevronRight size={20} />
                </button>
            </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setMainImageIndex(index)}
              className={`relative w-20 h-20 shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                mainImageIndex === index ? 'border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <Image
                src={img}
                alt={`Vista ${index + 1}`}
                fill
                sizes="80px"
                className="object-contain bg-white dark:bg-gray-700"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
