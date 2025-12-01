'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react';
import api from '@/lib/api';
import DashboardSkeleton from '@/components/features/admin/dashboard/DashboardSkeleton';

const RevenueChart = dynamic(() => import('@/components/features/admin/dashboard/RevenueChart'), {
  loading: () => <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />,
  ssr: false,
});

const OrderStatusChart = dynamic(() => import('@/components/features/admin/dashboard/OrderStatusChart'), {
  loading: () => <div className="h-[300px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />,
  ssr: false,
});

const RecentOrders = dynamic(() => import('@/components/features/admin/dashboard/RecentOrders'), {
  loading: () => <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />,
});

const TopProducts = dynamic(() => import('@/components/features/admin/dashboard/TopProducts'), {
  loading: () => <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />,
});

interface DashboardStats {
  products: number;
  orders: number;
  users: number;
  revenue: number;
  revenueByMonth: { name: string; total: number }[];
  orderStatusDistribution: { name: string; value: number }[];
  topProducts: { id: string; name: string; sold: number }[];
  recentOrders: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    user: { name: string | null; email: string };
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    revenueByMonth: [],
    orderStatusDistribution: [],
    topProducts: [],
    recentOrders: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        const data = response.data;

        setStats({
          products: data.totalProducts,
          orders: data.totalOrders,
          users: data.totalUsers,
          revenue: data.totalRevenue,
          revenueByMonth: data.revenueByMonth,
          orderStatusDistribution: data.orderStatusDistribution,
          topProducts: data.topProducts,
          recentOrders: data.recentOrders,
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
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      
      {/* KPI Cards */}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={stats.revenueByMonth} />
        </div>
        <div>
          <OrderStatusChart data={stats.orderStatusDistribution} />
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders orders={stats.recentOrders} />
        </div>
        <div>
          <TopProducts products={stats.topProducts} />
        </div>
      </div>
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
