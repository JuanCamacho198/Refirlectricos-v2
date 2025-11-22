'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface OrderStatusChartProps {
  data: { status: string; _count: { status: number } }[];
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
  const chartData = data.map(item => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item._count.status,
    color: COLORS[item.status as keyof typeof COLORS] || '#9CA3AF'
  }));

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Estado de Pedidos</h3>
      <div className="h-[300px] w-full">
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
