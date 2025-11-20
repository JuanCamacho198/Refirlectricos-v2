'use client';

import { useEffect, useState } from 'react';
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, you'd have a specific /stats endpoint.
        // Here we fetch all data and calculate locally (not efficient for large data, but fine for MVP)
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          api.get('/products'),
          api.get('/orders'),
          api.get('/users'),
        ]);

        const orders = ordersRes.data;
        const revenue = orders.reduce((acc: number, order: { status: string; total: number }) => acc + (order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED' ? order.total : 0), 0);

        setStats({
          products: productsRes.data.length,
          orders: orders.length,
          users: usersRes.data.length,
          revenue,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div>Cargando estadísticas...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Ingresos Totales" 
          value={`$${stats.revenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="text-green-600" 
          bg="bg-green-100 dark:bg-green-900/20"
        />
        <StatsCard 
          title="Pedidos" 
          value={stats.orders} 
          icon={ShoppingBag} 
          color="text-blue-600" 
          bg="bg-blue-100 dark:bg-blue-900/20"
        />
        <StatsCard 
          title="Productos" 
          value={stats.products} 
          icon={Package} 
          color="text-purple-600" 
          bg="bg-purple-100 dark:bg-purple-900/20"
        />
        <StatsCard 
          title="Usuarios" 
          value={stats.users} 
          icon={Users} 
          color="text-orange-600" 
          bg="bg-orange-100 dark:bg-orange-900/20"
        />
      </div>

      {/* Recent Activity or Charts could go here */}
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

function StatsCard({ title, value, icon: Icon, color, bg }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bg}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
      </div>
    </div>
  );
}
