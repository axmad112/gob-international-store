import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GOB International Store',
  description: 'A premium single-owner international storefront.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}