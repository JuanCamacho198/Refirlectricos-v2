'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCloudinaryUrl } from '@/lib/cloudinary';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

function ImageLightboxContent({
  images,
  initialIndex = 0,
  onClose,
}: Omit<ImageLightboxProps, 'isOpen'>) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrev();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, goToNext, goToPrev]);

  const currentImage = images[currentIndex];
  const optimizedImage = getCloudinaryUrl(currentImage, {
    width: 1200,
    height: 1200,
    crop: 'limit',
    quality: 'auto',
    format: 'auto',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Visor de imágenes"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Cerrar"
      >
        <X size={24} />
      </button>

      {/* Image counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={goToPrev}
          className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Imagen anterior"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Main image */}
      <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-4 flex items-center justify-center">
        <Image
          src={optimizedImage}
          alt={`Imagen ${currentIndex + 1}`}
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-contain"
          priority
        />
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={goToNext}
          className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Siguiente imagen"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Thumbnails at bottom */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 px-4 py-2 rounded-lg bg-black/50">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative w-12 h-12 rounded overflow-hidden transition-all ${
                currentIndex === index
                  ? 'ring-2 ring-white scale-110'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={getCloudinaryUrl(img, { width: 100, height: 100, crop: 'fill', quality: 'auto', format: 'auto' })}
                alt={`Miniatura ${index + 1}`}
                fill
                sizes="48px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  if (!isOpen || images.length === 0) return null;

  // Use key to reset internal state when initialIndex changes
  return (
    <ImageLightboxContent
      key={initialIndex}
      images={images}
      initialIndex={initialIndex}
      onClose={onClose}
    />
  );
}
