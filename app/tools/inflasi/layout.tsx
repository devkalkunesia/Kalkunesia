import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Kalkulator Inflasi 2025 — Nilai Uang Masa Depan & Masa Lalu | Kalkunesia',
  description: 'Hitung dampak inflasi terhadap nilai uang. Proyeksi daya beli masa depan dan konversi nilai masa lalu. Gratis.',
  keywords: ['kalkulator inflasi', 'nilai uang masa depan', 'daya beli', 'inflasi indonesia', 'kalkulator inflasi 2025'],
  openGraph: { title: 'Kalkulator Inflasi 2025 | Kalkunesia', description: 'Hitung dampak inflasi terhadap nilai uang.', url: 'https://kalkunesia.com/tools/inflasi' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
