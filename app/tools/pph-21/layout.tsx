import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalkulator PPh 21 2025 — Hitung Pajak Penghasilan Karyawan | Kalkunesia',
  description: 'Hitung PPh 21 karyawan sesuai tarif pajak & PTKP 2025 terbaru. Otomatis hitung TER, bruto, neto, dan pajak terutang. Gratis.',
  keywords: ['kalkulator pph 21', 'pajak penghasilan karyawan', 'pph 21 2025', 'ptkp 2025', 'ter pajak'],
  openGraph: {
    title: 'Kalkulator PPh 21 2025 | Kalkunesia',
    description: 'Hitung pajak penghasilan karyawan sesuai regulasi 2025.',
    url: 'https://kalkunesia.com/tools/pph-21',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
