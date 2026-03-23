import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalkulator BPHTB 2025 — Pajak Beli Properti | Kalkunesia',
  description: 'Hitung BPHTB (Bea Perolehan Hak atas Tanah dan Bangunan) untuk jual beli, waris, dan hibah properti. Gratis.',
  keywords: ['kalkulator bphtb', 'pajak beli rumah', 'bea perolehan hak tanah bangunan', 'bphtb 2025'],
  openGraph: {
    title: 'Kalkulator BPHTB 2025 | Kalkunesia',
    description: 'Hitung BPHTB untuk jual beli, waris, dan hibah properti.',
    url: 'https://kalkunesia.com/tools/bphtb',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
