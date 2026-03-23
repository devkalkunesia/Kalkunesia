import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalkulator ROI — Hitung Return on Investment | Kalkunesia',
  description: 'Hitung ROI (return on investment) dari bisnis, saham, properti, atau investasi apapun. Persentase keuntungan dan analisis lengkap.',
  keywords: ['kalkulator roi', 'return on investment', 'hitung roi bisnis', 'roi saham', 'roi properti'],
  openGraph: {
    title: 'Kalkulator ROI | Kalkunesia',
    description: 'Hitung return on investment dari bisnis dan portofolio kamu.',
    url: 'https://kalkunesia.com/tools/roi',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
