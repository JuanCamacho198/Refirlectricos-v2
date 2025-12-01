'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Filter } from 'lucide-react';
import ProductFiltersContainer from './ProductFiltersContainer';

interface MobileFiltersProps {
  categories: string[];
  subcategories: string[];
  brands: string[];
  structure?: { name: string; subcategories: string[] }[];
}

export default function MobileFilters({ categories, subcategories, brands, structure }: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        className="md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Filter size={20} />
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Filtrar Productos"
      >
        <ProductFiltersContainer
          categories={categories}
          subcategories={subcategories}
          brands={brands}
          structure={structure}
          className="shadow-none border-none p-0 static"
        />
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button onClick={() => setIsOpen(false)} className="w-full">
            Ver Resultados
          </Button>
        </div>
      </Modal>
    </>
  );
}
