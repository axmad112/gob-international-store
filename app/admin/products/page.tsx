import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const admin = await requireAdmin();
  const store = await db.store.findFirst({ where: { ownerId: admin.id }, include: { products: { orderBy: { createdAt: 'desc' }, include: { category: true } } } });
  const products = store?.products ?? [];
  return <main className="admin-shell"><aside className="sidebar"><Link className="brand inverse" href="/">GOB<span>•</span></Link><p className="sidebar-label">OWNER CONSOLE</p><nav><Link href="/admin">Overview</Link><Link className="active" href="/admin/products">Products</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/customers">Customers</Link><Link href="/admin/settings">Settings</Link></nav></aside><section className="admin-content"><div className="admin-heading"><div><p className="eyebrow">CATALOG CONTROL</p><h1>Products.</h1></div><span className="status-pill">{products.length} records</span></div><div className="admin-panel"><h2>Owner-managed catalog</h2><p>Only the authorized owner can publish products. AliExpress import remains disabled until authorized API credentials are configured.</p><Link className="button" href="/admin/products/new">Add product</Link></div><section className="admin-panel"><h2>Inventory</h2>{products.length === 0 ? <p>No product records exist yet.</p> : <div className="admin-table">{products.map((product) => <div className="admin-row" key={product.id}><span>{product.name}</span><span>{product.status}</span><span>{product.stock} in stock</span><Link className="text-link" href={`/admin/products/${product.id}`}>Edit</Link></div>)}</div>}</section></section></main>;
}