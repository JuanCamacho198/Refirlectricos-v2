'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface OrderStatusChartProps {
  data: { name: string; value: number }[];
}

const COLORS = {
  PENDING: '#F59E0B', // Yellow
  PAID: '#3B82F6',    // Blue
  SHIPPED: '#8B5CF6', // Purple
  DELIVERED: '#10B981', // Green
  CANCELLED: '#EF4444', // Red
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export default function OrderStatusChart({ data }: OrderStatusChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Pequeño delay para asegurar que el contenedor tenga dimensiones
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const chartData = data.map(item => ({
    name: STATUS_LABELS[item.name] || item.name,
    value: item.value,
    color: COLORS[item.name as keyof typeof COLORS] || '#9CA3AF'
  }));

  // Verificar si hay datos para mostrar
  const hasData = chartData.length > 0 && chartData.some(item => item.value > 0);

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Estado de Pedidos</h3>
        <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Estado de Pedidos</h3>
        <div className="h-[300px] w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 text-center">No hay datos de pedidos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Estado de Pedidos</h3>
      <div className="h-[300px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
