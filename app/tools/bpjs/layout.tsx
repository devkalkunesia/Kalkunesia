import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalkulator BPJS 2025 — Hitung Iuran Kesehatan & Ketenagakerjaan | Kalkunesia',
  description: 'Hitung iuran BPJS Kesehatan dan BPJS Ketenagakerjaan (JHT, JP, JKK, JKM) sesuai tarif 2025. Untuk karyawan dan pekerja mandiri.',
  keywords: ['kalkulator bpjs', 'iuran bpjs kesehatan 2025', 'bpjs ketenagakerjaan', 'jht jp jkk jkm', 'bpjs karyawan'],
  openGraph: {
    title: 'Kalkulator BPJS 2025 | Kalkunesia',
    description: 'Hitung iuran BPJS Kesehatan dan Ketenagakerjaan 2025.',
    url: 'https://kalkunesia.com/tools/bpjs',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
