'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, ArrowUpRight, Activity, RefreshCw, Filter, Download, Zap } from 'lucide-react';
import api from '@/lib/api';
import DashboardSkeleton from '@/components/features/admin/dashboard/DashboardSkeleton';

const RevenueChart = dynamic(() => import('@/components/features/admin/dashboard/RevenueChart'), {
  loading: () => <div className="h-[380px] bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse border border-slate-200 dark:border-slate-700/50" />,
  ssr: false,
});

const OrderStatusChart = dynamic(() => import('@/components/features/admin/dashboard/OrderStatusChart'), {
  loading: () => <div className="h-80 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse border border-slate-200 dark:border-slate-700/50" />,
  ssr: false,
});

const RecentOrders = dynamic(() => import('@/components/features/admin/dashboard/RecentOrders'), {
  loading: () => <div className="h-[420px] bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse border border-slate-200 dark:border-slate-700/50" />,
});

const TopProducts = dynamic(() => import('@/components/features/admin/dashboard/TopProducts'), {
  loading: () => <div className="h-[420px] bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse border border-slate-200 dark:border-slate-700/50" />,
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
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>('/dashboard/stats');
      return data;
    },
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const stats = data || {
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    revenueByMonth: [],
    orderStatusDistribution: [],
    topProducts: [],
    recentOrders: [],
  };

  const formatNumber = (value: unknown): string => {
    const num = typeof value === 'number' ? value : 0;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              Overview
            </span>
            <span className="text-slate-400 text-xs font-medium">Last updated: Just now</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            Dashboard <span className="text-slate-300 dark:text-slate-700">.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg max-w-2xl font-light">
            Real-time business intelligence and performance metrics.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <Activity className={`h-4 w-4 ${isFetching ? 'text-amber-500' : 'text-emerald-500'} ${!isFetching ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {isFetching ? 'Syncing...' : 'Live System Status'}
            </span>
          </div>
          
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl shadow-lg shadow-slate-900/20 dark:shadow-blue-600/20 hover:translate-y-[-1px] active:translate-y-[1px] transition-all disabled:opacity-70 disabled:hover:translate-y-0 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            <span className="font-semibold relative z-10">Refresh Data</span>
          </button>
        </div>
      </div>
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Revenue" 
          value={`$${formatNumber(stats.revenue)}`} 
          icon={DollarSign} 
          trend="+12.5%"
          trendUp={true}
          colorScheme="emerald"
          subtitle="Monthly gross income"
        />
        <StatsCard 
          title="Total Orders" 
          value={formatNumber(stats.orders)} 
          icon={ShoppingBag} 
          trend="+8.2%"
          trendUp={true}
          colorScheme="blue"
          subtitle="Successful transactions"
        />
        <StatsCard 
          title="Active Products" 
          value={formatNumber(stats.products)} 
          icon={Package} 
          trend="+2.1%"
          trendUp={true}
          colorScheme="violet"
          subtitle="In catalog"
        />
        <StatsCard 
          title="Total Users" 
          value={formatNumber(stats.users)} 
          icon={Users} 
          trend="+5.7%"
          trendUp={true}
          colorScheme="amber"
          subtitle="Registered accounts"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none">
              <TrendingUp size={120} />
           </div>
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Revenue Analytics</h3>
                 <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                    <Download size={18} />
                 </button>
              </div>
              <RevenueChart data={stats.revenueByMonth} />
           </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none">
              <Filter size={120} />
           </div>
           <div className="relative z-10">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Order Status</h3>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                    <Filter size={18} />
                </button>
             </div>
             <OrderStatusChart data={stats.orderStatusDistribution} />
           </div>
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
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
  trend?: string;
  trendUp?: boolean;
  colorScheme: 'emerald' | 'blue' | 'violet' | 'amber';
  subtitle?: string;
}

const colorSchemes = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-100 dark:border-emerald-900/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    trend: 'text-emerald-700 dark:text-emerald-400',
    trendBg: 'bg-emerald-100 dark:bg-emerald-500/10',
    gradient: 'from-emerald-600 to-teal-500',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-100 dark:border-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    trend: 'text-blue-700 dark:text-blue-400',
    trendBg: 'bg-blue-100 dark:bg-blue-500/10',
    gradient: 'from-blue-600 to-cyan-500',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    border: 'border-violet-100 dark:border-violet-900/30',
    icon: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    trend: 'text-violet-700 dark:text-violet-400',
    trendBg: 'bg-violet-100 dark:bg-violet-500/10',
    gradient: 'from-violet-600 to-fuchsia-500',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-100 dark:border-amber-900/30',
    icon: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    trend: 'text-amber-700 dark:text-amber-400',
    trendBg: 'bg-amber-100 dark:bg-amber-500/10',
    gradient: 'from-amber-600 to-orange-500',
  },
};

function StatsCard({ title, value, icon: Icon, trend, trendUp, colorScheme, subtitle }: StatsCardProps) {
  const scheme = colorSchemes[colorScheme];
  
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 hover:-translate-y-1">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${scheme.gradient} opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-all duration-500 group-hover:scale-150 group-hover:opacity-10`} />
      
      <div className="relative p-6 h-full flex flex-col justify-between z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3.5 rounded-2xl ${scheme.iconBg} ${scheme.icon} transition-transform duration-300 group-hover:rotate-6 shadow-sm`}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${scheme.trendBg} ${scheme.trend}`}>
              {trendUp ? <TrendingUp className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5 rotate-90" />}
              {trend}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>}
        </div>
      </div>
      
      {/* Bottom border gradient */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${scheme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </div>
  );
}
