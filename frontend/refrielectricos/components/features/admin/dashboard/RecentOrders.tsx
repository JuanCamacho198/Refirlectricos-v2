'use client';

import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';

interface RecentOrdersProps {
  orders: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    user: {
      name: string | null;
      email: string;
    };
  }[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pedidos Recientes</h3>
        <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
          Ver todos <ChevronRight size={16} />
        </Link>
      </div>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                <Package size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.user.name || order.user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  #{order.id.slice(-6).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">
                ${order.total.toLocaleString()}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'PAID': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'SHIPPED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'DELIVERED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-800';
  }
}
