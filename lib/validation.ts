import { z } from 'zod';

export const registrationSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(255), password: z.string().min(12).max(128) });
export const loginSchema = z.object({ email: z.string().trim().email().max(255), password: z.string().min(1).max(128) });
export const productSchema = z.object({ name: z.string().trim().min(2).max(180), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), description: z.string().max(10000).optional(), price: z.coerce.number().nonnegative(), compareAtPrice: z.coerce.number().nonnegative().optional(), cost: z.coerce.number().nonnegative().optional(), stock: z.coerce.number().int().nonnegative(), sku: z.string().trim().max(100).optional(), status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED']).default('DRAFT'), storeId: z.string().cuid(), categoryId: z.string().cuid().optional() });
export const cartItemSchema = z.object({ productId: z.string().cuid(), quantity: z.coerce.number().int().min(1).max(99), variantId: z.string().cuid().optional() });
