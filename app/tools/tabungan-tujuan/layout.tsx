import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Kalkulator Tabungan Tujuan 2025 — Simulasi Target | Kalkunesia',
  description: 'Hitung setoran bulanan untuk mencapai target tabungan. DP Rumah, dana nikah, liburan — simulasi dengan bunga. Gratis.',
  keywords: ['kalkulator tabungan', 'tabungan tujuan', 'target tabungan', 'simulasi menabung', 'setoran bulanan'],
  openGraph: { title: 'Kalkulator Tabungan Tujuan 2025 | Kalkunesia', description: 'Hitung setoran bulanan untuk mencapai target.', url: 'https://kalkunesia.com/tools/tabungan-tujuan' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
