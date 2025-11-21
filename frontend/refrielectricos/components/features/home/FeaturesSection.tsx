import { Truck, ShieldCheck, Headphones, CreditCard } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: "Envío Gratis",
    description: "En pedidos superiores a $300.000"
  },
  {
    icon: ShieldCheck,
    title: "Garantía Asegurada",
    description: "Productos 100% originales y garantizados"
  },
  {
    icon: Headphones,
    title: "Soporte Técnico",
    description: "Asesoría experta para tus compras"
  },
  {
    icon: CreditCard,
    title: "Pago Seguro",
    description: "Múltiples métodos de pago confiables"
  }
];

export default function FeaturesSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
      {features.map((feature, index) => (
        <div 
          key={index} 
          className="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
            <feature.icon size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {feature.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
