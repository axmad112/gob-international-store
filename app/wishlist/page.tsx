import Link from 'next/link';
import { getMyWishlist, toggleWishlist } from '../actions';
import { StoreHeader } from '../components/store-ui';

export default async function WishlistPage() {
  const wishlist = await getMyWishlist(); const items = wishlist?.items ?? [];
  return <main className="shell"><StoreHeader /><section className="page-intro"><p className="eyebrow">SAVED FOR LATER</p><h1>Wishlist.</h1><p>Your saved products are private to your account.</p></section><section className="section">{items.length === 0 ? <div className="empty-state"><h3>Your wishlist is empty</h3><p>Save published products for later.</p><Link className="button" href="/shop">Browse shop</Link></div> : <div className="product-grid">{items.map(({ product }) => <article className="product-card" key={product.id}><div className="product-thumb">{product.images[0] ? <img src={product.images[0].url} alt={product.images[0].alt ?? product.name} /> : <span>GOB</span>}</div><h2>{product.name}</h2><p>${product.price.toString()}</p><form action={toggleWishlist.bind(null, product.id)}><button className="text-link" type="submit">Remove from wishlist</button></form></article>)}</div>}</section></main>;
}