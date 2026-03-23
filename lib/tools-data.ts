export interface ToolInfo {
  name: string;
  slug: string;
  icon: string;
  description: string;
  category: string;
  badge?: { text: string; type: 'hot' | 'core' | 'new' };
  href: string;
}

export const tools: ToolInfo[] = [
  { name: 'KPR Calculator', slug: 'kpr', icon: '🏠', description: 'Hitung cicilan, total bunga, dan simulasi tenor KPR dengan tepat', category: 'Kredit & Properti', badge: { text: '🔥 HOT', type: 'hot' }, href: '/tools/kpr' },
  { name: 'PPh 21 Calculator', slug: 'pph-21', icon: '📋', description: 'Hitung pajak penghasilan sesuai tarif 2025', category: 'Pajak & Gaji', badge: { text: '🔥 HOT', type: 'hot' }, href: '/tools/pph-21' },
  { name: 'Invoice Generator', slug: 'invoice', icon: '🧾', description: 'Buat invoice profesional PDF dalam hitungan detik', category: 'Bisnis & Keuangan', badge: { text: '🔥 HOT', type: 'hot' }, href: '/tools/invoice' },
  { name: 'BPJS Calculator', slug: 'bpjs', icon: '🛡️', description: 'Hitung iuran BPJS Kesehatan dan Ketenagakerjaan', category: 'Pajak & Gaji', badge: { text: '✅ CORE', type: 'core' }, href: '/tools/bpjs' },
  { name: 'ROI Calculator', slug: 'roi', icon: '📈', description: 'Ukur return on investment bisnis atau portofolio kamu', category: 'Investasi', href: '/tools/roi' },
  { name: 'Compound Interest', slug: 'compound', icon: '💹', description: 'Simulasi bunga majemuk deposito dan investasi', category: 'Investasi', href: '/tools/compound' },
  { name: 'Budget Planner', slug: 'budget', icon: '📊', description: 'Rencanakan anggaran bulanan dengan metode 50/30/20', category: 'Bisnis & Keuangan', href: '/tools/budget' },
  { name: 'Kalkulator Gaji', slug: 'gaji', icon: '💰', description: 'Hitung take home pay setelah PPh 21 dan BPJS', category: 'Pajak & Gaji', badge: { text: '🔥 HOT', type: 'hot' }, href: '/tools/gaji' },
  { name: 'PPh 25 / Badan', slug: 'pph-25', icon: '🏢', description: 'Hitung angsuran PPh 25 untuk wiraswasta dan badan usaha', category: 'Pajak & Gaji', href: '/tools/pph-25' },
  { name: 'Currency Converter', slug: 'currency', icon: '💱', description: 'Konversi mata uang real-time 20+ valuta asing', category: 'Bisnis & Keuangan', href: '/tools/currency' },
  { name: 'Kalkulator PPN', slug: 'ppn', icon: '🧾', description: 'Hitung PPN 11% dan 12% otomatis — DPP, PPN terutang, harga setelah pajak', category: 'Pajak & Gaji', badge: { text: '🧾 PAJAK', type: 'new' }, href: '/tools/ppn' },
  { name: 'PPh Final UMKM', slug: 'pph-umkm', icon: '🏪', description: 'Hitung pajak UMKM 0.5% dari omzet sesuai PP 55/2022', category: 'Pajak & Gaji', badge: { text: '🏪 UMKM', type: 'new' }, href: '/tools/pph-umkm' },
  { name: 'Kalkulator Zakat', slug: 'zakat', icon: '☪️', description: 'Hitung zakat maal, penghasilan, dan fitrah sesuai ketentuan syariah', category: 'Keuangan Syariah', badge: { text: '☪️ ZAKAT', type: 'new' }, href: '/tools/zakat' },
  { name: 'Kalkulator Dana Darurat', slug: 'dana-darurat', icon: '🛡️', description: 'Hitung target dana darurat ideal dan simulasi pencapaiannya', category: 'Perencanaan', badge: { text: '🛡️ DARURAT', type: 'new' }, href: '/tools/dana-darurat' },
  { name: 'Kalkulator BPHTB', slug: 'bphtb', icon: '🏠', description: 'Hitung BPHTB untuk jual beli, waris, dan hibah properti', category: 'Kredit & Properti', badge: { text: '🏠 PROPERTI', type: 'new' }, href: '/tools/bphtb' },
  { name: 'Kalkulator Saham', slug: 'saham', icon: '📈', description: 'Hitung modal, fee broker, break even price, dan profit/loss saham BEI', category: 'Investasi', badge: { text: '📈 INVESTASI', type: 'new' }, href: '/tools/saham' },
  { name: 'Kalkulator Reksa Dana', slug: 'reksa-dana', icon: '💼', description: 'Simulasi pertumbuhan reksa dana dengan compound interest dan setoran rutin', category: 'Investasi', badge: { text: '💼 INVESTASI', type: 'new' }, href: '/tools/reksa-dana' },
  { name: 'Kalkulator Dana Pensiun', slug: 'dana-pensiun', icon: '👴', description: 'Hitung kebutuhan dana pensiun dan setoran bulanan yang diperlukan', category: 'Perencanaan', badge: { text: '👴 PENSIUN', type: 'new' }, href: '/tools/dana-pensiun' },
  { name: 'Tabungan Tujuan', slug: 'tabungan-tujuan', icon: '🎯', description: 'Hitung setoran bulanan untuk mencapai target tabungan apapun', category: 'Perencanaan', badge: { text: '🎯 TABUNGAN', type: 'new' }, href: '/tools/tabungan-tujuan' },
  { name: 'Kalkulator Inflasi', slug: 'inflasi', icon: '📉', description: 'Hitung dampak inflasi terhadap daya beli uang di masa depan dan lalu', category: 'Ekonomi', badge: { text: '📉 EKONOMI', type: 'new' }, href: '/tools/inflasi' },
  { name: 'Kalkulator BEP', slug: 'bep', icon: '📊', description: 'Hitung titik impas (break even point) usaha dalam unit dan rupiah', category: 'Bisnis & Keuangan', badge: { text: '📊 BISNIS', type: 'new' }, href: '/tools/bep' },
  { name: 'Kalkulator Harga Jual', slug: 'harga-jual', icon: '💰', description: 'Hitung harga jual ideal dari HPP dan target margin profit', category: 'Bisnis & Keuangan', badge: { text: '💰 BISNIS', type: 'new' }, href: '/tools/harga-jual' },
  { name: 'Kalkulator Komisi Sales', slug: 'komisi', icon: '🤝', description: 'Hitung komisi penjualan dengan struktur flat atau tiered', category: 'Bisnis & Keuangan', badge: { text: '🤝 BISNIS', type: 'new' }, href: '/tools/komisi' },
  { name: 'Kalkulator Net Worth', slug: 'net-worth', icon: '💎', description: 'Hitung kekayaan bersih — total aset dikurangi total hutang', category: 'Perencanaan', badge: { text: '💎 KEUANGAN', type: 'new' }, href: '/tools/net-worth' },
];

export function getToolBySlug(slug: string): ToolInfo | undefined {
  return tools.find(t => t.slug === slug);
}

export function getRelatedTools(currentSlug: string, count = 4): ToolInfo[] {
  return tools.filter(t => t.slug !== currentSlug).slice(0, count);
}
