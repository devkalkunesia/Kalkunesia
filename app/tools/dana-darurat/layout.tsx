import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalkulator Dana Darurat 2025 — Target & Simulasi Tabungan | Kalkunesia',
  description: 'Hitung target dana darurat ideal berdasarkan status dan pekerjaan. Simulasi berapa bulan untuk mencapai target. Gratis.',
  keywords: ['kalkulator dana darurat', 'emergency fund', 'target dana darurat', 'simulasi tabungan darurat'],
  openGraph: {
    title: 'Kalkulator Dana Darurat 2025 | Kalkunesia',
    description: 'Hitung target dana darurat ideal dan simulasi pencapaiannya.',
    url: 'https://kalkunesia.com/tools/dana-darurat',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
