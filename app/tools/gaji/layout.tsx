import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalkulator Gaji Bersih — Hitung Take Home Pay THP | Kalkunesia',
  description: 'Hitung gaji bersih (take home pay) setelah potongan PPh 21, BPJS Kesehatan, dan BPJS Ketenagakerjaan. Sesuai regulasi 2025.',
  keywords: ['kalkulator gaji bersih', 'take home pay', 'thp gaji', 'potongan gaji karyawan', 'gaji neto 2025'],
  openGraph: {
    title: 'Kalkulator Gaji Bersih THP | Kalkunesia',
    description: 'Hitung take home pay setelah semua potongan pajak dan BPJS.',
    url: 'https://kalkunesia.com/tools/gaji',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
