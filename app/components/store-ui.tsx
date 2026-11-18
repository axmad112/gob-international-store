'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export type Language = 'en' | 'so' | 'ar';

const copy = {
  en: { shop: 'Shop', account: 'Account', wishlist: 'Wishlist', cart: 'Cart', signIn: 'Sign in', emptyTitle: 'No published products yet', emptyText: 'The owner has not published any products. This catalog intentionally shows no sample inventory.' },
  so: { shop: 'Duka', account: 'Akoonka', wishlist: 'Liiska rabitaanka', cart: 'Gaadhiga', signIn: 'Soo gal', emptyTitle: 'Weli badeecooyin la daabacay ma jiraan', emptyText: 'Milkiiluhu weli ma daabicin badeecooyin. Liiskani ma muujinayo badeecooyin tusaale ah.' },
  ar: { shop: 'المتجر', account: 'الحساب', wishlist: 'المفضلة', cart: 'السلة', signIn: 'تسجيل الدخول', emptyTitle: 'لا توجد منتجات منشورة بعد', emptyText: 'لم ينشر المالك أي منتجات بعد. لا يعرض هذا الكتالوج مخزوناً تجريبياً.' },
} as const;

export function LanguageSelect() {
  const [language, setLanguage] = useState<Language>('en');
  useEffect(() => { const saved = window.localStorage.getItem('gob-language') as Language | null; if (saved && saved in copy) setLanguage(saved); }, []);
  function change(value: Language) { setLanguage(value); window.localStorage.setItem('gob-language', value); document.documentElement.lang = value; document.documentElement.dir = value === 'ar' ? 'rtl' : 'ltr'; }
  return <label className="select-label"><span className="sr-only">Language</span><select value={language} onChange={(event) => change(event.target.value as Language)} aria-label="Language"><option value="en">English</option><option value="so">Af-Soomaali</option><option value="ar">العربية</option></select></label>;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState('system');
  useEffect(() => { const saved = window.localStorage.getItem('gob-theme') ?? 'system'; setTheme(saved); applyTheme(saved); }, []);
  function applyTheme(value: string) { document.documentElement.dataset.theme = value; window.localStorage.setItem('gob-theme', value); }
  return <select className="theme-select" value={theme} onChange={(event) => { setTheme(event.target.value); applyTheme(event.target.value); }} aria-label="Theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select>;
}

export function StoreHeader({ active = '' }: { active?: string }) {
  return <header className="topbar"><Link className="brand" href="/">GOB<span>•</span></Link><nav aria-label="Main navigation"><Link className={active === 'shop' ? 'active' : ''} href="/shop">{copy.en.shop}</Link><Link href="/categories">Categories</Link><Link className={active === 'account' ? 'active' : ''} href="/account">{copy.en.account}</Link></nav><div className="actions"><LanguageSelect /><Link href="/wishlist">♡</Link><Link href="/cart">{copy.en.cart} (0)</Link><Link className="button small" href="/login">{copy.en.signIn}</Link></div></header>;
}

export function EmptyCatalog({ title = copy.en.emptyTitle, text = copy.en.emptyText }: { title?: string; text?: string }) {
  return <div className="empty-state"><div className="empty-icon">◎</div><h3>{title}</h3><p>{text}</p><Link className="button" href="/account">Owner/admin access</Link></div>;
}

export function AddToCartButton() {
  const [added, setAdded] = useState(false);
  return <button className="button" type="button" onClick={() => setAdded(true)} disabled={added}>{added ? 'Added to cart' : 'Add to cart'}</button>;
}

export function SearchForm() {
  return <form className="search-form" action="/shop" method="get"><label htmlFor="product-search">Search products</label><input id="product-search" name="q" placeholder="Search the catalog" /><button className="button small" type="submit">Search</button></form>;
}
