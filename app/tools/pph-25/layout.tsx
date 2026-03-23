import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalkulator PPh 25 — Angsuran Pajak Badan & Wiraswasta | Kalkunesia',
  description: 'Hitung angsuran PPh Pasal 25 untuk wiraswasta, profesional, UMKM, dan badan usaha. Sesuai ketentuan perpajakan Indonesia 2025.',
  keywords: ['kalkulator pph 25', 'pph pasal 25', 'pajak badan usaha', 'angsuran pph wiraswasta', 'pph umkm 2025'],
  openGraph: {
    title: 'Kalkulator PPh 25 Badan | Kalkunesia',
    description: 'Hitung angsuran PPh 25 untuk wiraswasta dan badan usaha.',
    url: 'https://kalkunesia.com/tools/pph-25',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
