import { getPublishedProduct } from '@/lib/products';
import { AddToCartButton, StoreHeader } from '../../components/store-ui';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getPublishedProduct((await params).slug);
  if (!product) return <main className="shell"><StoreHeader /><section className="section"><h1>Product not found.</h1><p>This product is not published or no longer available.</p></section></main>;
  return <main className="shell"><StoreHeader /><section className="section product-placeholder"><div className="product-image-placeholder">{product.images[0] ? <img src={product.images[0].url} alt={product.images[0].alt ?? product.name} /> : 'GOB'}</div><div><p className="eyebrow">{product.category?.name ?? 'GOB collection'}</p><h1>{product.name}</h1><p className="lead">{product.description ?? 'Product description provided by the GOB owner.'}</p><p>${product.price.toString()}</p><p>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p><AddToCartButton /></div></section></main>;
}