
import { z } from 'zod';

export const productSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    slug: z.string().optional(), // Often generated, but can be provided
    description: z.string().optional(),
    price: z.number().positive().or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number)), // Handle string or number input
    stock: z.number().int().min(0).or(z.string().regex(/^\d+$/).transform(Number)),
    category_id: z.string().optional(), // Or UUID if you use UUIDs
    brand_id: z.string().optional(),
    images: z.array(z.string().url()).optional(),
  }),
});

export const productUpdateSchema = z.object({
  body: productSchema.shape.body.partial(),
});
