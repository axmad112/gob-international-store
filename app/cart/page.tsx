import { StoreHeader, EmptyCatalog } from '../components/store-ui';

export default function CartPage() { return <main className="shell"><StoreHeader active="cart" /><section className="page-intro"><p className="eyebrow">YOUR BAG</p><h1>Shopping cart.</h1><p>Cart data will persist through the database after authentication is configured.</p></section><section className="section"><EmptyCatalog title="Your cart is empty" text="No products have been added. Browse the catalog after the owner publishes inventory." /></section></main>; }
