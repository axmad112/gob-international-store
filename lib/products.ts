import { db } from '@/lib/db';

export async function listPublishedProducts(query?: string) {
  const term = query?.trim();
  return db.product.findMany({ where: { status: 'PUBLISHED', ...(term ? { OR: [{ name: { contains: term, mode: 'insensitive' } }, { description: { contains: term, mode: 'insensitive' } }] } : {}) }, include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, variants: true, category: true }, orderBy: { createdAt: 'desc' } });
}

export async function getPublishedProduct(slug: string) {
  return db.product.findFirst({ where: { slug, status: 'PUBLISHED' }, include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true, category: true } });
}
