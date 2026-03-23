import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Kalkulator Break Even Point 2025 — BEP Unit & Rupiah | Kalkunesia',
  description: 'Hitung titik impas (BEP) dalam unit dan rupiah. Tentukan berapa unit harus dijual untuk balik modal. Gratis.',
  keywords: ['kalkulator bep', 'break even point', 'titik impas', 'bep usaha', 'bep umkm'],
  openGraph: { title: 'Kalkulator BEP 2025 | Kalkunesia', description: 'Hitung break even point usaha kamu.', url: 'https://kalkunesia.com/tools/bep' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
