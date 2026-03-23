import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Budget Planner — Rencanakan Anggaran Bulanan 50/30/20 | Kalkunesia',
  description: 'Rencanakan anggaran keuangan bulanan dengan metode 50/30/20. Hitung alokasi kebutuhan, keinginan, dan tabungan dari gaji kamu secara otomatis.',
  keywords: ['budget planner', 'anggaran bulanan', 'metode 50 30 20', 'perencanaan keuangan', 'atur keuangan bulanan'],
  openGraph: {
    title: 'Budget Planner 50/30/20 | Kalkunesia',
    description: 'Rencanakan anggaran bulanan dengan metode 50/30/20.',
    url: 'https://kalkunesia.com/tools/budget',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
