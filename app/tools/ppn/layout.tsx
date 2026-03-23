import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalkulator PPN 2025 — Hitung Pajak Pertambahan Nilai | Kalkunesia',
  description: 'Hitung PPN 11% dan 12% otomatis. Dapatkan DPP, PPN terutang, dan harga setelah pajak. Gratis tanpa daftar.',
  keywords: ['kalkulator ppn', 'pajak pertambahan nilai', 'ppn 11 persen', 'ppn 12 persen', 'hitung ppn online'],
  openGraph: {
    title: 'Kalkulator PPN 2025 | Kalkunesia',
    description: 'Hitung PPN otomatis — DPP, PPN terutang, dan harga setelah pajak.',
    url: 'https://kalkunesia.com/tools/ppn',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
