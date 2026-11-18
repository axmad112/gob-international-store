import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { createOrder } from '../actions';
import { StoreHeader } from '../components/store-ui';

export default async function CheckoutPage() {
  const user = await requireUser(); const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: { id: 'desc' } });
  return <main className="shell"><StoreHeader /><section className="page-intro"><p className="eyebrow">CHECKOUT REQUEST</p><h1>Confirm your order.</h1><p>Online payment is not connected. Your order will remain Awaiting Payment until a future approved payment integration is added.</p></section><section className="section"><div className="admin-panel"><h2>Shipping address</h2>{addresses.length === 0 ? <p>Add a saved address from your account before checkout.</p> : <>{addresses.map((address) => <form className="address-choice" action={createOrder.bind(null, address.id)} key={address.id}><label><input type="radio" name="address" defaultChecked /> {address.label}: {address.fullName}, {address.line1}, {address.city}, {address.country}</label><button className="button" type="submit">Place order — Awaiting Payment</button></form>)}</>}<Link className="text-link" href="/account">Manage addresses →</Link></div></section></main>;
}