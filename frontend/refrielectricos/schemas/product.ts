import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  image_url: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
});

export type ProductFormData = z.infer<typeof productSchema>;
