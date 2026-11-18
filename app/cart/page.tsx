import Link from 'next/link';
import { getMyCart, removeCartItem, updateCartItem } from '../actions';
import { StoreHeader } from '../components/store-ui';

export default async function CartPage() {
  const cart = await getMyCart();
  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  return <main className="shell"><StoreHeader active="cart" /><section className="page-intro"><p className="eyebrow">YOUR BAG</p><h1>Shopping cart.</h1><p>Payment processing is not connected. Orders are created as Awaiting Payment.</p></section><section className="section">{items.length === 0 ? <div className="empty-state"><h3>Your cart is empty</h3><p>Sign in and add published products to begin.</p><Link className="button" href="/shop">Browse shop</Link></div> : <div className="cart-layout"><div className="cart-items">{items.map((item) => <article className="cart-row" key={item.id}><div><h2>{item.product.name}</h2><p>${item.product.price.toString()} each · {item.product.stock} in stock</p></div><form action={updateCartItem.bind(null, item.id)}><label>Quantity<input name="quantity" type="number" min="1" max={item.product.stock} defaultValue={item.quantity} /></label><button className="button small" type="submit">Update</button></form><form action={removeCartItem.bind(null, item.id)}><button className="text-link" type="submit">Remove</button></form></article>)}</div><aside className="cart-summary"><p>Subtotal</p><strong>${subtotal.toFixed(2)}</strong><p>Shipping is calculated from configured rules.</p><Link className="button" href="/checkout">Continue to checkout</Link></aside></div>}</section></main>;
}