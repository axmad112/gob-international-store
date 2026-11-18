import { StoreHeader, EmptyCatalog } from '../../components/store-ui';

export default function ProductPage() {
  return <main className="shell"><StoreHeader /><section className="section product-placeholder"><div className="product-image-placeholder">GOB</div><div><p className="eyebrow">PRODUCT DETAILS</p><h1>Product details will appear here.</h1><p className="lead">Published products, images, variants, stock, offers and prices will be loaded from the database. No product data is fabricated.</p><EmptyCatalog title="No product selected" text="Choose a published product from the catalog to view its details." /></div></section></main>;
}