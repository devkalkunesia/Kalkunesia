import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Kalkulator Saham 2025 — Hitung Profit, Fee & Break Even | Kalkunesia',
  description: 'Hitung modal, fee broker, profit/loss, ROI%, dan break even price saham BEI. Gratis tanpa daftar.',
  keywords: ['kalkulator saham', 'hitung profit saham', 'fee broker saham', 'break even saham', 'investasi saham'],
  openGraph: { title: 'Kalkulator Saham 2025 | Kalkunesia', description: 'Hitung modal, fee, dan profit/loss saham BEI.', url: 'https://kalkunesia.com/tools/saham' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
