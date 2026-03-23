import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Konversi Mata Uang — Kurs Rupiah Real-Time | Kalkunesia',
  description: 'Konversi rupiah ke 13+ mata uang asing (USD, EUR, SGD, MYR, JPY, dll) dengan kurs referensi terkini. Update otomatis setiap hari.',
  keywords: ['konversi mata uang', 'kurs rupiah hari ini', 'kurs dollar ke rupiah', 'kurs euro rupiah', 'currency converter indonesia'],
  openGraph: {
    title: 'Konversi Mata Uang Real-Time | Kalkunesia',
    description: 'Konversi rupiah ke 13+ mata uang asing dengan kurs terkini.',
    url: 'https://kalkunesia.com/tools/currency',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
