'use server';

import { db } from '@/lib/db';
import { requireAdmin, requireUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const statusSchema = z.enum(['AWAITING_PAYMENT', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
const offerStatusSchema = z.enum(['ACCEPTED', 'REJECTED', 'COUNTERED', 'EXPIRED']);
const messageStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
const addressSchema = z.object({ label: z.string().trim().min(1).max(50), fullName: z.string().trim().min(2).max(120), line1: z.string().trim().min(3).max(180), line2: z.string().trim().max(180).optional(), city: z.string().trim().min(2).max(80), country: z.string().trim().min(2).max(80), postalCode: z.string().trim().max(30).optional(), phone: z.string().trim().max(30).optional() });

export async function updateOrderStatus(orderId: string, status: string, note?: string) {
  const admin = await requireAdmin(); const parsed = statusSchema.safeParse(status); if (!parsed.success) return { ok: false, error: 'Invalid order status.' };
  const order = await db.order.findUnique({ where: { id: orderId }, select: { id: true, userId: true, orderNumber: true } }); if (!order) return { ok: false, error: 'Order not found.' };
  await db.$transaction([db.order.update({ where: { id: orderId }, data: { status: parsed.data } }), db.orderStatusHistory.create({ data: { orderId, status: parsed.data, note: note?.trim() || null } }), db.notification.create({ data: { userId: order.userId, title: `Order ${order.orderNumber} updated`, body: `Your order status is now ${parsed.data}.` } }), db.auditLog.create({ data: { userId: admin.id, action: 'UPDATE_STATUS', entity: 'Order', entityId: orderId, metadata: { status: parsed.data } })]);
  revalidatePath('/admin/orders'); revalidatePath('/account'); return { ok: true };
}

export async function updateOffer(offerId: string, status: string, message?: string) {
  const admin = await requireAdmin(); const parsed = offerStatusSchema.safeParse(status); if (!parsed.success) return { ok: false, error: 'Invalid offer decision.' };
  const offer = await db.offer.findUnique({ where: { id: offerId }, include: { product: true } }); if (!offer) return { ok: false, error: 'Offer not found.' };
  await db.$transaction([db.offer.update({ where: { id: offerId }, data: { status: parsed.data, message: message?.trim() || offer.message } }), db.notification.create({ data: { userId: offer.userId, title: 'Offer update', body: `Your offer for ${offer.product.name} was ${parsed.data.toLowerCase()}.` } }), db.auditLog.create({ data: { userId: admin.id, action: 'UPDATE_OFFER', entity: 'Offer', entityId: offerId } })]);
  revalidatePath('/admin/offers'); return { ok: true };
}

export async function updateSupportMessage(messageId: string, status: string) { const admin = await requireAdmin(); const parsed = messageStatusSchema.safeParse(status); if (!parsed.success) return { ok: false, error: 'Invalid message status.' }; const result = await db.supportMessage.updateMany({ where: { id: messageId }, data: { status: parsed.data } }); await db.auditLog.create({ data: { userId: admin.id, action: 'UPDATE_SUPPORT', entity: 'SupportMessage', entityId: messageId, metadata: { status: parsed.data } } }); revalidatePath('/admin/support'); return { ok: result.count === 1 }; }

export async function createAddress(formData: FormData) { const user = await requireUser(); const parsed = addressSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) return { ok: false, error: 'Please complete the address.' }; await db.address.create({ data: { ...parsed.data, userId: user.id } }); revalidatePath('/checkout'); revalidatePath('/account'); return { ok: true }; }
export async function submitSupportMessage(formData: FormData) { const user = await requireUser(); const subject = String(formData.get('subject') ?? '').trim(); const body = String(formData.get('body') ?? '').trim(); if (subject.length < 2 || body.length < 5) return { ok: false, error: 'Please enter a subject and message.' }; await db.supportMessage.create({ data: { userId: user.id, subject, body } }); return { ok: true }; }

export async function getAdminOverview() { await requireAdmin(); const [orders, customers, products, revenue, profit] = await Promise.all([db.order.count(), db.user.count({ where: { role: 'CUSTOMER' } }), db.product.count(), db.order.aggregate({ _sum: { total: true } }), db.orderItem.findMany({ select: { unitPrice: true, quantity: true, product: { select: { cost: true } } } })]); const estimatedProfit = profit.reduce((sum, item) => sum + ((Number(item.unitPrice) - Number(item.product.cost ?? 0)) * item.quantity), 0); return { orders, customers, products, revenue: Number(revenue._sum.total ?? 0), estimatedProfit }; }
