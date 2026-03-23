import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invoice Generator Gratis — Buat Invoice PDF Profesional | Kalkunesia',
  description: 'Buat invoice profesional dan cetak sebagai PDF dalam hitungan detik. Gratis, tanpa daftar, langsung bisa digunakan untuk bisnis dan freelancer.',
  keywords: ['invoice generator gratis', 'buat invoice pdf', 'faktur penjualan', 'invoice freelancer', 'template invoice indonesia'],
  openGraph: {
    title: 'Invoice Generator Gratis | Kalkunesia',
    description: 'Buat invoice PDF profesional dalam hitungan detik. Gratis.',
    url: 'https://kalkunesia.com/tools/invoice',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
