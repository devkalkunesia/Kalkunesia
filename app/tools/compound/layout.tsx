import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalkulator Bunga Majemuk — Simulasi Investasi & Deposito | Kalkunesia',
  description: 'Simulasi pertumbuhan investasi dengan bunga berbunga (compound interest). Hitung nilai akhir deposito, reksa dana, atau tabungan dalam jangka panjang.',
  keywords: ['kalkulator bunga majemuk', 'compound interest', 'simulasi deposito', 'bunga berbunga investasi', 'kalkulator investasi'],
  openGraph: {
    title: 'Kalkulator Bunga Majemuk | Kalkunesia',
    description: 'Simulasi pertumbuhan investasi dengan compound interest.',
    url: 'https://kalkunesia.com/tools/compound',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
