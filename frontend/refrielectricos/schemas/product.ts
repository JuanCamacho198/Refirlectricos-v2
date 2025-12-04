import { z } from 'zod';

export const specificationSchema = z.object({
  label: z.string().min(1, 'La etiqueta es requerida'),
  value: z.string().min(1, 'El valor es requerido'),
});

export const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  image_url: z.string()
    .url('URL de imagen inválida')
    .startsWith('https://', 'La URL debe ser segura (https://)')
    .optional()
    .or(z.literal('')),
  images_url: z.array(z.string().url()).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  tags: z.array(z.string()).optional(),
  specifications: z.array(specificationSchema).optional(),
  isActive: z.boolean().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type SpecificationFormData = z.infer<typeof specificationSchema>;
