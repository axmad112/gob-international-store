import Link from 'next/link';

const categories = ['Men’s Clothing', 'Women’s Clothing', 'Electronics', 'Home & Living'];

export default function HomePage() {
  return (
    <main className="shell">
      <header className="topbar">
        <Link className="brand" href="/">GOB<span>•</span></Link>
        <nav aria-label="Main navigation"><Link href="/">Home</Link><Link href="/shop">Shop</Link><Link href="/account">Account</Link></nav>
        <div className="actions"><button aria-label="Search">⌕</button><Link href="/cart">Cart (0)</Link><Link className="button small" href="/login">Sign in</Link></div>
      </header>
      <section className="hero"><div><p className="eyebrow">CURATED FOR EVERYDAY</p><h1>Find what fits your world.</h1><p className="lead">A considered collection of useful, expressive products from the GOB store.</p><div className="hero-actions"><Link className="button" href="/shop">Explore the collection</Link><Link className="text-link" href="/shop">View new arrivals →</Link></div></div><div className="hero-card"><span>GOB / 01</span><strong>Quality<br/>meets<br/>curiosity.</strong><small>Single-owner store · Payment coming soon</small></div></section>
      <section className="section"><div className="section-heading"><div><p className="eyebrow">BROWSE BY MOOD</p><h2>Start somewhere good.</h2></div><Link className="text-link" href="/shop">All categories →</Link></div><div className="category-grid">{categories.map((category) => <Link className="category-card" href="/shop" key={category}><span>Collection</span><strong>{category}</strong><em>Explore →</em></Link>)}</div></section>
      <section className="section muted"><div className="section-heading"><div><p className="eyebrow">EDITORIAL NOTE</p><h2>Built around real products.</h2></div></div><div className="empty-state"><div className="empty-icon">◎</div><h3>Products are on their way.</h3><p>The GOB catalog is being connected to the owner database. No sample products or fabricated inventory are shown.</p><Link className="button" href="/login">Owner sign in</Link></div></section>
      <footer><span className="brand">GOB<span>•</span></span><span>Single-owner international store · Phase 1</span><span>English · Soomaali · العربية</span></footer>
    </main>
  );
}