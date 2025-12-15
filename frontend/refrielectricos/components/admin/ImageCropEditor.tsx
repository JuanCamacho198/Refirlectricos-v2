'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { ZoomIn, ZoomOut, Move, RotateCcw, Check, X, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ImageCropEditorProps {
  imageUrl: string;
  onSave: (croppedAreaPixels: Area, zoom: number) => Promise<void>;
  onCancel: () => void;
  aspectRatio?: number;
}

export default function ImageCropEditor({
  imageUrl,
  onSave,
  onCancel,
  aspectRatio = 1, // 1:1 for product cards
}: ImageCropEditorProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 1));
  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsSaving(true);
    try {
      await onSave(croppedAreaPixels, zoom);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Move size={20} />
            Ajustar imagen
          </h3>
          <button
            onClick={onCancel}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative h-[400px] bg-gray-900">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={true}
            style={{
              containerStyle: {
                backgroundColor: '#1a1a1a',
              },
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Zoom out"
            >
              <ZoomOut size={18} />
            </button>
            <div className="flex-1">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Zoom in"
            >
              <ZoomIn size={18} />
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Instructions */}
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Arrastra para mover • Usa la rueda del mouse o el slider para hacer zoom
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-gray-600 dark:text-gray-400"
            >
              <RotateCcw size={16} className="mr-1" />
              Restablecer
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !croppedAreaPixels}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="mr-1 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-1" />
                    Aplicar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Utility to create a cropped image from crop data
 * This can be used to generate a new cropped image file
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}
