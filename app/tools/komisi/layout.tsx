import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Kalkulator Komisi Sales 2025 — Flat & Tiered | Kalkunesia',
  description: 'Hitung komisi sales berdasarkan struktur flat atau tiered. Achievement rate dan total penghasilan. Gratis.',
  keywords: ['kalkulator komisi', 'komisi sales', 'target penjualan', 'achievement rate', 'sales commission'],
  openGraph: { title: 'Kalkulator Komisi Sales 2025 | Kalkunesia', description: 'Hitung komisi sales flat dan tiered.', url: 'https://kalkunesia.com/tools/komisi' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
