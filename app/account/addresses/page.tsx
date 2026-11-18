import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { StoreHeader } from '../components/store-ui';
import AddressForm from '../components/address-form';

export const dynamic = 'force-dynamic';
export default async function AccountAddressesPage() { const user = await requireUser(); const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: { id: 'desc' } }); return <main className="shell"><StoreHeader active="account" /><section className="page-intro"><p className="eyebrow">ACCOUNT SETTINGS</p><h1>Saved addresses.</h1></section><section className="section"><div className="dashboard-grid"><div className="admin-panel"><h2>Add address</h2><AddressForm /></div><div className="admin-panel"><h2>Your addresses</h2>{addresses.length === 0 ? <p>No saved addresses.</p> : addresses.map((address) => <p key={address.id}><strong>{address.label}</strong><br />{address.fullName}<br />{address.line1}, {address.city}, {address.country}</p>)}</div></div></section></main>; }
