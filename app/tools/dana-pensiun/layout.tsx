import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Kalkulator Dana Pensiun 2025 — Perencanaan Pensiun | Kalkunesia',
  description: 'Hitung kebutuhan dana pensiun, proyeksi inflasi, dan setoran bulanan yang diperlukan. Grafik proyeksi investasi. Gratis.',
  keywords: ['kalkulator dana pensiun', 'perencanaan pensiun', 'tabungan pensiun', 'DPLK', 'pensiun 2025'],
  openGraph: { title: 'Kalkulator Dana Pensiun 2025 | Kalkunesia', description: 'Hitung kebutuhan dana pensiun dan setoran bulanan.', url: 'https://kalkunesia.com/tools/dana-pensiun' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
