import { Specification } from '@/types/product';

interface ProductSpecificationsProps {
  specifications: Specification[];
  title?: string;
}

export default function ProductSpecifications({ 
  specifications, 
  title = 'Especificaciones' 
}: ProductSpecificationsProps) {
  if (!specifications || specifications.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mt-8 transition-colors">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {specifications.map((spec, index) => (
              <tr 
                key={index}
                className={index % 2 === 0 
                  ? 'bg-gray-50 dark:bg-gray-800/50' 
                  : 'bg-white dark:bg-gray-800'
                }
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 w-1/3">
                  {spec.label}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
