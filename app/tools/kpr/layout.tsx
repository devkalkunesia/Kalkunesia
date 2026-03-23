import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalkulator KPR 2025 — Simulasi Cicilan & Amortisasi | Kalkunesia',
  description: 'Hitung cicilan KPR, total bunga, dan tabel amortisasi lengkap. Simulasi tenor 5–30 tahun, extra payment, dan biaya KPR. Gratis tanpa daftar.',
  keywords: ['kalkulator kpr', 'simulasi cicilan rumah', 'tabel amortisasi', 'kredit pemilikan rumah', 'cicilan kpr 2025'],
  openGraph: {
    title: 'Kalkulator KPR 2025 | Kalkunesia',
    description: 'Simulasi cicilan KPR lengkap dengan tabel amortisasi dan grafik.',
    url: 'https://kalkunesia.com/tools/kpr',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
