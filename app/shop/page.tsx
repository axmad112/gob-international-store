import { listPublishedProducts } from '@/lib/products';
import { StoreHeader, EmptyCatalog, SearchForm } from '../components/store-ui';

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const products = await listPublishedProducts(params.q);
  return <main className="shell"><StoreHeader active="shop" /><section className="page-intro"><p className="eyebrow">THE CATALOG</p><h1>Shop all products.</h1><p>Browse published GOB inventory.</p><SearchForm /></section><section className="section"><div className="filter-row"><span>{products.length} published products</span><select aria-label="Sort products"><option>Sort by newest</option><option>Price: low to high</option><option>Price: high to low</option></select></div>{products.length === 0 ? <EmptyCatalog /> : <div className="product-grid">{products.map((product) => <article className="product-card" key={product.id}><div className="product-thumb">{product.images[0] ? <img src={product.images[0].url} alt={product.images[0].alt ?? product.name} /> : <span>GOB</span>}</div><p className="eyebrow">{product.category?.name ?? 'GOB collection'}</p><h2>{product.name}</h2><p>${product.price.toString()}</p></article>)}</div>}</section></main>;
}