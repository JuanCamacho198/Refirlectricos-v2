'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
}

export default function Pagination({ currentPage, lastPage }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (lastPage <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="p-2"
      >
        <ChevronLeft size={20} />
      </Button>
      
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Página {currentPage} de {lastPage}
      </span>

      <Button
        variant="outline"
        disabled={currentPage === lastPage}
        onClick={() => handlePageChange(currentPage + 1)}
        className="p-2"
      >
        <ChevronRight size={20} />
      </Button>
    </div>
  );
}
