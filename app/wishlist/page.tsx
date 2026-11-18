import { StoreHeader, EmptyCatalog } from '../components/store-ui';

export default function WishlistPage() { return <main className="shell"><StoreHeader /><section className="page-intro"><p className="eyebrow">SAVED FOR LATER</p><h1>Wishlist.</h1><p>Save products you love once published inventory is available.</p></section><section className="section"><EmptyCatalog title="Your wishlist is empty" text="There are no saved products yet." /></section></main>; }
