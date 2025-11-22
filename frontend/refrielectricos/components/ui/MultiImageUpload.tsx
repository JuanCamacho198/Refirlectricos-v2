'use client';

import { useState, useRef } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

export default function MultiImageUpload({ value = [], onChange, disabled }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    //const newUrls: string[] = [];

    try {
      // Upload files sequentially or in parallel
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...value, ...uploadedUrls]);
      addToast(`${uploadedUrls.length} imagen(es) subida(s) correctamente`, 'success');
    } catch (error) {
      console.error('Error uploading images:', error);
      addToast('Error al subir las imágenes', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {value.map((url, index) => (
          <div key={url + index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
            <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled || isUploading}
                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-sm"
              >
                <X size={14} />
              </button>
            </div>
            <Image
              src={url}
              alt={`Product Image ${index + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
        >
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          </div>
          <div className="text-center px-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {isUploading ? '...' : 'Agregar'}
            </p>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}
