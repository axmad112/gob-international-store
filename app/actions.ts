'use server';

import { db } from '@/lib/db';
import { createSession, destroySession, hashPassword, requireAdmin, requireUser, verifyPassword } from '@/lib/auth';
import { cartItemSchema, loginSchema, productSchema, registrationSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';

export async function registerUser(formData: FormData) {
  const parsed = registrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Please enter a valid name, email, and password of at least 12 characters.' };
  const email = parsed.data.email.toLowerCase();
  if (await db.user.findUnique({ where: { email } })) return { ok: false, error: 'An account with this email already exists.' };
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
  const admin = await requireAdmin(); const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Product data is invalid.' };
  const { storeId, categoryId, ...data } = parsed.data;
  if (!(await db.store.findFirst({ where: { id: storeId, ownerId: admin.id } }))) return { ok: false, error: 'Store access denied.' };
  const product = await db.product.create({ data: { ...data, storeId, categoryId, inventory: { create: { quantity: data.stock, reason: 'INITIAL_STOCK' } } } });
  revalidatePath('/shop'); revalidatePath('/admin/products'); return { ok: true, productId: product.id };
}
export async function updateProduct(productId: string, formData: FormData) {
  const admin = await requireAdmin(); const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Product data is invalid.' };
  const { storeId, categoryId, ...data } = parsed.data;
  const result = await db.product.updateMany({ where: { id: productId, storeId, store: { ownerId: admin.id } }, data: { ...data, categoryId } });
  revalidatePath('/shop'); return { ok: result.count === 1 };
}
export async function deleteProduct(productId: string) { const admin = await requireAdmin(); const result = await db.product.deleteMany({ where: { id: productId, store: { ownerId: admin.id } } }); revalidatePath('/shop'); return { ok: result.count === 1 }; }

export async function getMyCart() { const user = await requireUser(); return db.cart.findUnique({ where: { userId: user.id }, include: { items: { include: { product: { include: { images: true, variants: true } } } } } }); }
export async function addCartItem(productId: string, quantity = 1, variantId?: string) {
  const user = await requireUser(); const parsed = cartItemSchema.safeParse({ productId, quantity, variantId }); if (!parsed.success) return { ok: false, error: 'Invalid cart item.' };
  const product = await db.product.findFirst({ where: { id: productId, status: 'PUBLISHED' } }); if (!product || product.stock < quantity) return { ok: false, error: 'Product is unavailable or out of stock.' };
  const cart = await db.cart.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
  const existing = await db.cartItem.findFirst({ where: { cartId: cart.id, productId, variantId: variantId ?? null } });
  if (existing) await db.cartItem.update({ where: { id: existing.id }, data: { quantity: Math.min(existing.quantity + quantity, product.stock) } }); else await db.cartItem.create({ data: { cartId: cart.id, productId, variantId, quantity } });
  revalidatePath('/cart'); return { ok: true };
}
export async function updateCartItem(itemId: string, quantity: number) { const user = await requireUser(); if (!Number.isInteger(quantity) || quantity < 1) return removeCartItem(itemId); const item = await db.cartItem.findFirst({ where: { id: itemId, cart: { userId: user.id } }, include: { product: true } }); if (!item) return { ok: false, error: 'Cart item not found.' }; await db.cartItem.update({ where: { id: itemId }, data: { quantity: Math.min(quantity, item.product.stock) } }); revalidatePath('/cart'); return { ok: true }; }
export async function removeCartItem(itemId: string) { const user = await requireUser(); await db.cartItem.deleteMany({ where: { id: itemId, cart: { userId: user.id } } }); revalidatePath('/cart'); return { ok: true }; }

export async function toggleWishlist(productId: string) { const user = await requireUser(); const wishlist = await db.wishlist.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} }); const item = await db.wishlistItem.findFirst({ where: { wishlistId: wishlist.id, productId } }); if (item) await db.wishlistItem.delete({ where: { id: item.id } }); else await db.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } }); revalidatePath('/wishlist'); return { ok: true, saved: !item }; }
export async function getMyWishlist() { const user = await requireUser(); return db.wishlist.findUnique({ where: { userId: user.id }, include: { items: { include: { product: { include: { images: true } } } } } }); }

export async function createOrder(addressId: string) {
  const user = await requireUser(); const address = await db.address.findFirst({ where: { id: addressId, userId: user.id } }); if (!address) return { ok: false, error: 'Shipping address not found.' };
  const cart = await db.cart.findUnique({ where: { userId: user.id }, include: { items: { include: { product: true } } } }); if (!cart || cart.items.length === 0) return { ok: false, error: 'Your cart is empty.' };
  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0); const orderNumber = `GOB-${randomUUID().slice(0, 8).toUpperCase()}`;
  const order = await db.$transaction(async (tx) => { for (const item of cart.items) { const updated = await tx.product.updateMany({ where: { id: item.productId, status: 'PUBLISHED', stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } }); if (updated.count !== 1) throw new Error('INSUFFICIENT_STOCK'); await tx.inventoryMovement.create({ data: { productId: item.productId, quantity: -item.quantity, reason: 'ORDER' } }); } const created = await tx.order.create({ data: { orderNumber, userId: user.id, addressId, status: 'AWAITING_PAYMENT', subtotal, discount: 0, shipping: 0, total: subtotal, items: { create: cart.items.map((item) => ({ productId: item.productId, nameSnapshot: item.product.name, unitPrice: item.product.price, quantity: item.quantity })) } } }); await tx.cartItem.deleteMany({ where: { cartId: cart.id } }); return created; });
  revalidatePath('/cart'); revalidatePath('/account'); return { ok: true, orderId: order.id, orderNumber };
}

export async function submitOffer(productId: string, amount: number, message?: string) { const user = await requireUser(); if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: 'Enter a valid offer.' }; const product = await db.product.findFirst({ where: { id: productId, status: 'PUBLISHED' } }); if (!product) return { ok: false, error: 'Product is unavailable.' }; await db.offer.create({ data: { productId, userId: user.id, amount, message } }); return { ok: true }; }
export async function submitSupport(subject: string, body: string) { const user = await requireUser(); if (subject.trim().length < 2 || body.trim().length < 5) return { ok: false, error: 'Enter a subject and message.' }; await db.supportMessage.create({ data: { userId: user.id, subject: subject.trim(), body: body.trim() } }); return { ok: true }; }
