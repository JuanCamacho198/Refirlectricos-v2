import Link from 'next/link';
import { Wrench, Snowflake, Zap, Thermometer } from 'lucide-react';

const categories = [
  {
    name: "Refrigeración",
    icon: Snowflake,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    href: "/products?category=Refrigeración"
  },
  {
    name: "Lavadoras",
    icon: Zap, // Usando Zap como placeholder para electrodomésticos/energía
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    href: "/products?category=Lavadoras"
  },
  {
    name: "Herramientas",
    icon: Wrench,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    href: "/products?category=Herramientas"
  },
  {
    name: "Aires Acondicionados",
    icon: Thermometer,
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    href: "/products?category=Aires"
  }
];

export default function CategoriesGrid() {
  return (
    <div className="py-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Categorías Populares</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link 
            key={cat.name} 
            href={cat.href}
            className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all duration-300"
          >
            <div className={`p-4 rounded-full mb-4 transition-transform group-hover:scale-110 ${cat.color}`}>
              <cat.icon size={32} />
            </div>
            <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
