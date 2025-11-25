'use client';

import { TrendingUp, Package } from 'lucide-react';

interface TopProductsProps {
  products: {
    id: string;
    name: string;
    sold: number;
  }[];
}

export default function TopProducts({ products }: TopProductsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Productos Más Vendidos</h3>
      {products.length === 0 ? (
        <div className="h-[200px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <Package size={40} className="text-gray-400 dark:text-gray-600 mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-center">No hay productos vendidos aún</p>
        </div>
      ) : (
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`
                flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                  index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : 
                  index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
                  'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}
              `}>
                {index + 1}
              </span>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                {product.name}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <TrendingUp size={14} />
              <span>{product.sold} ventas</span>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
