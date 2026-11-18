import { StoreHeader, EmptyCatalog, SearchForm } from '../components/store-ui';

export default function ShopPage() {
  return <main className="shell"><StoreHeader active="shop" /><section className="page-intro"><p className="eyebrow">THE CATALOG</p><h1>Shop all products.</h1><p>Browse published GOB inventory when it becomes available.</p><SearchForm /></section><section className="section"><div className="filter-row"><span>0 published products</span><select aria-label="Sort products"><option>Sort by newest</option><option>Price: low to high</option><option>Price: high to low</option></select></div><EmptyCatalog /></section></main>;
}