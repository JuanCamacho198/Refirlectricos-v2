import { Tag } from 'lucide-react';

interface ProductDescriptionProps {
  description: string;
  tags?: string[];
}

export default function ProductDescription({ description, tags }: ProductDescriptionProps) {
  // Check if description contains HTML (from rich text editor)
  const isHtml = description && (
    description.includes('<p>') || 
    description.includes('<ul>') || 
    description.includes('<strong>') ||
    description.includes('<em>')
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mt-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Descripción del Producto</h2>
      <div className="prose prose-blue dark:prose-invert max-w-none mb-8">
        {description ? (
          isHtml ? (
            <div 
              className="text-gray-600 dark:text-gray-300 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline [&_p]:mb-3"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className="whitespace-pre-line text-gray-600 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          )
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">
            Sin descripción disponible.
          </p>
        )}
      </div>

      {tags && tags.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Etiquetas</h3>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <Tag size={14} className="mr-2" />
                    {tag}
                </span>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
