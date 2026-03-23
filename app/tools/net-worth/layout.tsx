import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Kalkulator Net Worth 2025 — Aset vs Liabilitas | Kalkunesia',
  description: 'Hitung net worth pribadi — total aset dikurangi total hutang. Pantau kesehatan keuangan dengan debt ratio. Gratis.',
  keywords: ['kalkulator net worth', 'kekayaan bersih', 'aset liabilitas', 'debt ratio', 'kesehatan keuangan'],
  openGraph: { title: 'Kalkulator Net Worth 2025 | Kalkunesia', description: 'Hitung net worth pribadi kamu.', url: 'https://kalkunesia.com/tools/net-worth' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
