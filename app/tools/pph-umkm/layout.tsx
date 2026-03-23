import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalkulator PPh Final UMKM 2025 — Pajak 0.5% Omzet | Kalkunesia',
  description: 'Hitung PPh Final UMKM 0.5% sesuai PP 55/2022. Cek kewajiban PKP dan estimasi pajak bulanan/tahunan. Gratis.',
  keywords: ['pph umkm', 'pajak umkm', 'pph final 0.5 persen', 'pp 55 2022', 'pajak usaha kecil'],
  openGraph: {
    title: 'Kalkulator PPh Final UMKM 2025 | Kalkunesia',
    description: 'Hitung pajak UMKM 0.5% dari omzet — cek status PKP dan estimasi pajak.',
    url: 'https://kalkunesia.com/tools/pph-umkm',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
