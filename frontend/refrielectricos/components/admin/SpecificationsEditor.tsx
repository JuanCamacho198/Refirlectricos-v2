'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface Specification {
  label: string;
  value: string;
}

interface SpecificationsEditorProps {
  value: Specification[];
  onChange: (specs: Specification[]) => void;
  disabled?: boolean;
}

export default function SpecificationsEditor({ 
  value = [], 
  onChange, 
  disabled = false 
}: SpecificationsEditorProps) {
  
  const addSpecification = () => {
    onChange([...value, { label: '', value: '' }]);
  };

  const removeSpecification = (index: number) => {
    const newSpecs = value.filter((_, i) => i !== index);
    onChange(newSpecs);
  };

  const updateSpecification = (index: number, field: 'label' | 'value', newValue: string) => {
    const newSpecs = value.map((spec, i) => 
      i === index ? { ...spec, [field]: newValue } : spec
    );
    onChange(newSpecs);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Especificaciones
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSpecification}
          disabled={disabled}
          className="text-xs"
        >
          <Plus size={14} className="mr-1" />
          Agregar
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          No hay especificaciones. Haz clic en &quot;Agregar&quot; para añadir una.
        </p>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <div className="w-6"></div>
            <div>Característica</div>
            <div>Valor</div>
            <div className="w-8"></div>
          </div>

          {/* Rows */}
          {value.map((spec, index) => (
            <div
              key={index}
              className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="text-gray-400 dark:text-gray-500 cursor-grab">
                <GripVertical size={16} />
              </div>
              
              <input
                type="text"
                value={spec.label}
                onChange={(e) => updateSpecification(index, 'label', e.target.value)}
                placeholder="Ej: Voltaje"
                disabled={disabled}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              
              <input
                type="text"
                value={spec.value}
                onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                placeholder="Ej: 110V"
                disabled={disabled}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              
              <button
                type="button"
                onClick={() => removeSpecification(index)}
                disabled={disabled}
                className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Las especificaciones se mostrarán como una tabla en la página del producto.
      </p>
    </div>
  );
}
