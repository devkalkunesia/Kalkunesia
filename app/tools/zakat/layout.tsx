import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalkulator Zakat 2025 — Maal, Penghasilan & Fitrah | Kalkunesia',
  description: 'Hitung zakat maal, zakat penghasilan, dan zakat fitrah sesuai ketentuan syariah. Cek nisab dan nominal zakat. Gratis.',
  keywords: ['kalkulator zakat', 'zakat maal', 'zakat penghasilan', 'zakat fitrah', 'nisab zakat 2025'],
  openGraph: {
    title: 'Kalkulator Zakat 2025 | Kalkunesia',
    description: 'Hitung zakat maal, penghasilan, dan fitrah otomatis.',
    url: 'https://kalkunesia.com/tools/zakat',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
