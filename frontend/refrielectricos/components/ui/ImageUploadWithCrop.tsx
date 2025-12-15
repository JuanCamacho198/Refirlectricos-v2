'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Crop } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import ImageCropEditor, { getCroppedImg } from '@/components/admin/ImageCropEditor';
import type { Area } from 'react-easy-crop';

interface ImageUploadWithCropProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  showCropButton?: boolean;
}

export default function ImageUploadWithCrop({ 
  value, 
  onChange, 
  disabled,
  showCropButton = true 
}: ImageUploadWithCropProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showCropEditor, setShowCropEditor] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    await handleFileSelected(file);
  };

  const handleFileSelected = async (file: File) => {
    // Create a temporary URL for the crop editor
    const objectUrl = URL.createObjectURL(file);
    setTempImageUrl(objectUrl);
    setShowCropEditor(true);
  };

  const uploadFile = async (file: File | Blob, filename?: string) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file, filename || 'cropped-image.jpg');

    try {
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onChange(response.data.url);
      addToast('Imagen subida correctamente', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      addToast('Error al subir la imagen', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropSave = async (croppedAreaPixels: Area) => {
    if (!tempImageUrl) return;

    try {
      const croppedBlob = await getCroppedImg(tempImageUrl, croppedAreaPixels);
      if (croppedBlob) {
        await uploadFile(croppedBlob, 'cropped-product-image.jpg');
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      addToast('Error al recortar la imagen', 'error');
    } finally {
      // Clean up
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }
      setTempImageUrl(null);
      setShowCropEditor(false);
    }
  };

  const handleCropCancel = () => {
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
    }
    setTempImageUrl(null);
    setShowCropEditor(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileSelected(file);
  };

  const handleRemove = () => {
    onChange('');
  };

  const handleEditCrop = () => {
    if (value) {
      setTempImageUrl(value);
      setShowCropEditor(true);
    }
  };

  return (
    <>
      <div className="space-y-4 w-full">
        <div className="flex items-start gap-4">
          {value ? (
            <div className="relative w-[200px] h-[200px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
              {/* Action buttons */}
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                {showCropButton && (
                  <button
                    type="button"
                    onClick={handleEditCrop}
                    disabled={disabled || isUploading}
                    className="bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                    title="Ajustar imagen"
                  >
                    <Crop size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                  className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                  title="Eliminar imagen"
                >
                  <X size={14} />
                </button>
              </div>
              <Image
                src={value}
                alt="Product Image"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-[200px] h-[200px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
                {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isUploading ? 'Subiendo...' : isDragging ? 'Suelta aquí' : 'Subir imagen'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  JPG, PNG, WEBP
                </p>
              </div>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>

      {/* Crop Editor Modal */}
      {showCropEditor && tempImageUrl && (
        <ImageCropEditor
          imageUrl={tempImageUrl}
          onSave={handleCropSave}
          onCancel={handleCropCancel}
          aspectRatio={1}
        />
      )}
    </>
  );
}
