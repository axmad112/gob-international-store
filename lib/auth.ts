import { cookies } from 'next/headers';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { db } from './db';

const SESSION_COOKIE = 'gob_session';
const SESSION_DAYS = 30;

export function hashPassword(password: string) { const salt = randomBytes(16).toString('hex'); const key = scryptSync(password, salt, 64).toString('hex'); return `${salt}:${key}`; }
export function verifyPassword(password: string, encoded: string) { const [salt, key] = encoded.split(':'); if (!salt || !key) return false; const derived = scryptSync(password, salt, 64); const stored = Buffer.from(key, 'hex'); return stored.length === derived.length && timingSafeEqual(stored, derived); }
function hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }
export async function createSession(userId: string) { const token = randomBytes(32).toString('hex'); const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000); await db.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt } }); const jar = await cookies(); jar.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: expiresAt, path: '/' }); }
export async function destroySession() { const jar = await cookies(); const token = jar.get(SESSION_COOKIE)?.value; if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } }); jar.delete(SESSION_COOKIE); }
export async function getCurrentUser() { const token = (await cookies()).get(SESSION_COOKIE)?.value; if (!token) return null; const session = await db.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } }); if (!session || session.expiresAt <= new Date()) return null; return session.user; }
export async function requireUser() { const user = await getCurrentUser(); if (!user) throw new Error('UNAUTHENTICATED'); return user; }
export async function requireAdmin() { const user = await requireUser(); if (user.role !== 'ADMIN') throw new Error('FORBIDDEN'); return user; }
