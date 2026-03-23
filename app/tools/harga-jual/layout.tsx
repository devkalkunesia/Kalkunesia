import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Kalkulator Harga Jual 2025 — HPP, Margin & Markup | Kalkunesia',
  description: 'Hitung harga jual ideal berdasarkan HPP dan target margin profit. Simulasi berbagai margin. Gratis.',
  keywords: ['kalkulator harga jual', 'hpp', 'margin profit', 'markup', 'pricing umkm'],
  openGraph: { title: 'Kalkulator Harga Jual 2025 | Kalkunesia', description: 'Hitung harga jual ideal dari HPP dan margin.', url: 'https://kalkunesia.com/tools/harga-jual' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
