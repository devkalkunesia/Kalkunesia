import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Kalkulator Reksa Dana 2025 — Simulasi Pertumbuhan Investasi | Kalkunesia',
  description: 'Simulasi pertumbuhan reksa dana dengan setoran rutin dan compound interest. Grafik proyeksi investasi. Gratis.',
  keywords: ['kalkulator reksa dana', 'simulasi reksa dana', 'compound interest reksa dana', 'investasi reksa dana'],
  openGraph: { title: 'Kalkulator Reksa Dana 2025 | Kalkunesia', description: 'Simulasi pertumbuhan investasi reksa dana.', url: 'https://kalkunesia.com/tools/reksa-dana' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
