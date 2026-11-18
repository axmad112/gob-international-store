'use server';

import { db } from '@/lib/db';
import { createSession, destroySession, hashPassword, requireAdmin, requireUser, verifyPassword } from '@/lib/auth';
import { loginSchema, productSchema, registrationSchema } from '@/lib/validation';

export async function registerUser(formData: FormData) {
  const parsed = registrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Please enter a valid name, email, and password of at least 12 characters.' };
  const email = parsed.data.email.toLowerCase();
  const exists = await db.user.findUnique({ where: { email } });
  if (exists) return { ok: false, error: 'An account with this email already exists.' };
  const user = await db.user.create({ data: { name: parsed.data.name, email, passwordHash: hashPassword(parsed.data.password), role: 'CUSTOMER' } });
  await createSession(user.id);
  return { ok: true };
}

export async function loginUser(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Invalid email or password.' };
  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) return { ok: false, error: 'Invalid email or password.' };
  await createSession(user.id);
  return { ok: true, role: user.role };
}

export async function logoutUser() { await destroySession(); return { ok: true }; }

export async function createProduct(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Product data is invalid.' };
  const { storeId, categoryId, ...data } = parsed.data;
  const store = await db.store.findFirst({ where: { id: storeId, ownerId: admin.id } });
  if (!store) return { ok: false, error: 'Store access denied.' };
  const product = await db.product.create({ data: { ...data, price: data.price, compareAtPrice: data.compareAtPrice, cost: data.cost, storeId, categoryId } });
  return { ok: true, productId: product.id };
}

export async function updateProduct(productId: string, formData: FormData) {
  const admin = await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Product data is invalid.' };
  const { storeId, categoryId, ...data } = parsed.data;
  const product = await db.product.updateMany({ where: { id: productId, storeId, store: { ownerId: admin.id } }, data: { ...data, categoryId } });
  return { ok: product.count === 1 };
}

export async function deleteProduct(productId: string) {
  const admin = await requireAdmin();
  const product = await db.product.deleteMany({ where: { id: productId, store: { ownerId: admin.id } } });
  return { ok: product.count === 1 };
}

export async function getMyCart() {
  const user = await requireUser();
  return db.cart.findUnique({ where: { userId: user.id }, include: { items: { include: { product: { include: { images: true, variants: true } } } } } });
}

export async function addCartItem(productId: string, quantity = 1, variantId?: string) {
  const user = await requireUser();
  const product = await db.product.findFirst({ where: { id: productId, status: 'PUBLISHED' } });
  if (!product || product.stock < quantity) return { ok: false, error: 'Product is unavailable or out of stock.' };
  const cart = await db.cart.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
  const existing = await db.cartItem.findFirst({ where: { cartId: cart.id, productId, variantId: variantId ?? null } });
  if (existing) await db.cartItem.update({ where: { id: existing.id }, data: { quantity: Math.min(existing.quantity + quantity, product.stock) } });
  else await db.cartItem.create({ data: { cartId: cart.id, productId, variantId, quantity } });
  return { ok: true };
}

export async function removeCartItem(itemId: string) {
  const user = await requireUser();
  await db.cartItem.deleteMany({ where: { id: itemId, cart: { userId: user.id } } });
  return { ok: true };
}
