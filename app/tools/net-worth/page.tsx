'use client';
import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import ToolHero from '@/components/ToolHero';
import ToolLayout from '@/components/ToolLayout';
import FaqSection from '@/components/FaqSection';
import MoreTools from '@/components/MoreTools';
import { TipsCard, RelatedToolsCard, BlogCard, KamusCard } from '@/components/SidebarCards';
import { FooterSimple } from '@/components/Footer';
import SaveHistoryButton from '@/components/SaveHistoryButton';
import { formatRupiah, showToast, copyResult, shareResult, exportPDF, formatNumber, parseNumber } from '@/lib/utils';
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';

const Chart = dynamic(() => import('react-chartjs-2').then(m => m.Chart), { ssr: false });

const faqItems = [
  { question: 'Apa itu net worth?', answer: 'Net worth = total aset - total hutang. Ini menunjukkan kekayaan bersih kamu. Net worth positif berarti aset lebih besar dari hutang.' },
  { question: 'Berapa debt ratio yang sehat?', answer: '<30% sehat, 30-50% hati-hati, >50% berbahaya. Semakin rendah debt ratio, semakin sehat posisi keuangan.' },
  { question: 'Bagaimana meningkatkan net worth?', answer: 'Tambah aset (tabungan, investasi), kurangi hutang (lunasi kartu kredit), dan naikkan pendapatan. Prioritaskan lunasi hutang berbunga tinggi.' },
  { question: 'Seberapa sering harus cek net worth?', answer: 'Idealnya setiap 3-6 bulan. Tracking rutin membantu melihat progres keuangan dan membuat keputusan lebih baik.' },
];

export default function NetWorthPage() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_net_worth_inputs', {
    kas: 50000000, investasi: 30000000, properti: 500000000, kendaraan: 150000000, asetLain: 0,
    kpr: 350000000, kta: 80000000, kartuKredit: 5000000, hutangLain: 0,
  });
  const { kas, investasi, properti, kendaraan, asetLain, kpr, kta, kartuKredit, hutangLain } = inputs;
  const setField = (k: string, v: number) => setInputs(prev => ({ ...prev, [k]: v }));
  const [show, setShow] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  useScrollReveal(); useBackToTop();

  useEffect(() => { import('chart.js').then(mod => { mod.Chart.register(mod.ArcElement, mod.Tooltip, mod.Legend); setChartReady(true); }); }, []);

  const totalAset = kas + investasi + properti + kendaraan + asetLain;
  const totalLiabilitas = kpr + kta + kartuKredit + hutangLain;
  const netWorth = totalAset - totalLiabilitas;
  const debtRatio = totalAset > 0 ? (totalLiabilitas / totalAset) * 100 : 0;
  const debtCategory = debtRatio < 30 ? '🟢 Sehat' : debtRatio < 50 ? '🟡 Hati-hati' : '🔴 Berbahaya';
  const debtRecommendation = debtRatio < 30
    ? 'Rasio hutang Anda relatif sehat. Fokus menjaga arus kas dan tambah porsi investasi produktif.'
    : debtRatio < 50
      ? 'Rasio hutang perlu dijaga. Prioritaskan pelunasan utang berbunga tinggi sambil menahan utang baru.'
      : 'Rasio hutang tinggi. Fokus utama adalah restrukturisasi dan pelunasan utang agar risiko finansial menurun.';

  const asetBreakdown = [
    { label: 'Kas & Tabungan', value: kas, color: '#0D9488' },
    { label: 'Investasi', value: investasi, color: '#14B8A6' },
    { label: 'Properti', value: properti, color: '#1B3C53' },
    { label: 'Kendaraan', value: kendaraan, color: '#296374' },
    { label: 'Lainnya', value: asetLain, color: '#94A3B8' },
  ].filter(a => a.value > 0);

  const hitung = useCallback(() => { setShow(true); }, []);
  useEffect(() => { const t = setTimeout(hitung, 300); return () => clearTimeout(t); }, [hitung]);

  const mkInput = (label: string, key: string, val: number) => (
    <div className="input-group"><label htmlFor={key} className="input-label">{label}</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id={key} type="text" inputMode="numeric" className="calc-input" value={formatNumber(val)} onChange={e => setField(key, parseNumber(e.target.value))} /></div></div>
  );

  return (
    <>
      <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Kalkulator Net Worth — Kalkunesia', description: 'Hitung net worth pribadi.', url: 'https://kalkunesia.com/tools/net-worth', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' }, provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' } })}</script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Net Worth" />
      <div className="tool-hero-wrapper">
        <ToolHero icon="💎" badge="💎" title="Kalkulator Net Worth" subtitle="Hitung kekayaan bersih pribadi — total aset dikurangi total hutang. Pantau kesehatan keuangan kamu." tags={['✓ Aset', '✓ Liabilitas', '✓ Debt Ratio', '✓ Gratis']} />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot assistant dengan diamond</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle className="robot-antenna" cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8" />
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53" />
            <circle className="robot-eye" cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="35" cy="33" r="2.5" fill="#fff" />
            <circle className="robot-eye" cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="55" cy="33" r="2.5" fill="#fff" />
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6" />
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448" />
            <rect className="robot-badge" x="34" y="62" width="24" height="20" rx="6" fill="#0D9488" opacity="0.9" />
            <text x="46" y="76" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">💎</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <g className="robot-diamond">
              <polygon points="64,70 72,62 80,70 72,78" fill="#f472b6" stroke="#ec4899" strokeWidth="1.2" />
              <line x1="72" y1="54" x2="72" y2="62" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
              <circle cx="72" cy="54" r="3" fill="#f472b6" opacity="0.9" />
            </g>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#111827" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#111827" />
          </svg>
        </div>
      </div>
      <ToolLayout
        sidebar={
          <> 
            {/* <AdSenseBox size="rectangle" /> */}
            <TipsCard
              title="💡 Tips Net Worth"
              items={[
                { icon: '📈', text: 'Track net worth setiap 3-6 bulan' },
                { icon: '💰', text: 'Prioritaskan lunasi hutang berbunga tinggi (kartu kredit)' },
                { icon: '🏠', text: 'Properti = aset tapi juga ada biaya maintenance' },
                { icon: '📊', text: 'Target debt ratio < 30% untuk keuangan sehat' },
              ]}
            />
            <RelatedToolsCard
              items={[
                { icon: '🛡️', name: 'Dana Darurat', desc: 'Target dana darurat', href: '/tools/dana-darurat' },
                { icon: '📊', name: 'Budget Planner', desc: 'Anggaran 50/30/20', href: '/tools/budget' },
                { icon: '🎯', name: 'Tabungan Tujuan', desc: 'Target tabungan', href: '/tools/tabungan-tujuan' },
              ]}
            />
            <KamusCard
              terms={[
                { term: 'Net Worth', def: 'Kekayaan bersih (total aset dikurangi total liabilitas/hutang).' },
                { term: 'Aset', def: 'Segala sesuatu yang dimiliki dan memiliki nilai ekonomi.' },
                { term: 'Liabilitas', def: 'Semua kewajiban finansial atau hutang yang harus dibayar.' },
                { term: 'Debt Ratio', def: 'Persentase hutang terhadap total aset, idealnya di bawah 30%.' },
                { term: 'Likuid', def: 'Aset yang mudah diubah menjadi uang tunai tanpa kehilangan nilai signifikan.' },
                { term: 'Net Worth Negatif', def: 'Kondisi di mana total hutang melebihi total aset yang dimiliki.' },
              ]}
            />
            <BlogCard
              posts={[
                { title: 'Urutan Prioritas Keuangan yang Benar', category: 'Perencanaan', readTime: '5 menit', slug: 'prioritas-keuangan' },
                { title: 'Cara Hitung Net Worth Kamu Sendiri', category: 'Keuangan', readTime: '3 menit', slug: 'cara-hitung-net-worth' },
              ]}
            />
          </>
        }
      >
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />Kalkulator Net Worth</div>
          {/* ASET */}
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>📦 Aset</div>
          <div className="input-grid">
            {mkInput('Kas & Tabungan', 'kas', kas)}
            {mkInput('Investasi (Saham, Reksa Dana)', 'investasi', investasi)}
            {mkInput('Nilai Properti', 'properti', properti)}
            {mkInput('Kendaraan', 'kendaraan', kendaraan)}
            {mkInput('Aset Lainnya', 'asetLain', asetLain)}
          </div>
          {/* LIABILITAS */}
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 12, marginTop: 20, textTransform: 'uppercase', letterSpacing: 1 }}>💳 Hutang / Liabilitas</div>
          <div className="input-grid">
            {mkInput('Sisa KPR', 'kpr', kpr)}
            {mkInput('KTA', 'kta', kta)}
            {mkInput('Kartu Kredit', 'kartuKredit', kartuKredit)}
            {mkInput('Hutang Lainnya', 'hutangLain', hutangLain)}
          </div>
          {show && (<div>
            <div className="result-divider" />
            <div className="result-title-label">Hasil Analisa Net Worth</div>
            <div className="result-grid">
              <div className="result-card" style={{ background: netWorth >= 0 ? 'linear-gradient(135deg, #0D9488, #14B8A6)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}><div className="result-label">Net Worth</div><div className="result-value">{formatRupiah(netWorth)}</div><div className="result-sub">{netWorth >= 0 ? '✅ Positif' : '❌ Negatif'}</div></div>
              <div className="result-card"><div className="result-label">Total Aset</div><div className="result-value">{formatRupiah(totalAset)}</div><div className="result-sub">5 kategori</div></div>
              <div className="result-card"><div className="result-label">Debt Ratio</div><div className="result-value" style={{ color: debtRatio < 30 ? '#2DD4BF' : debtRatio < 50 ? '#eab308' : '#ef4444' }}>{debtRatio.toFixed(1)}%</div><div className="result-sub">{debtRatio < 30 ? '✅ Sehat' : debtRatio < 50 ? '⚠️ Hati-hati' : '❌ Berbahaya'}</div></div>
            </div>
            {chartReady && asetBreakdown.length > 0 && (
              <div className="chart-section show" style={{ marginTop: 16 }}>
                <div style={{ height: 260 }}>
                  <Chart type="doughnut" data={{ labels: asetBreakdown.map(a => a.label), datasets: [{ data: asetBreakdown.map(a => a.value), backgroundColor: asetBreakdown.map(a => a.color), borderWidth: 0, borderRadius: 6 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, font: { size: 10, weight: 'bold' } } } } }} />
                </div>
              </div>
            )}
            <table className="result-table"><thead><tr><th>Komponen</th><th>Nilai</th></tr></thead><tbody>
              <tr><td>Kas & Tabungan</td><td className="right">{formatRupiah(kas)}</td></tr>
              <tr><td>Investasi</td><td className="right">{formatRupiah(investasi)}</td></tr>
              <tr><td>Properti</td><td className="right">{formatRupiah(properti)}</td></tr>
              <tr><td>Kendaraan</td><td className="right">{formatRupiah(kendaraan)}</td></tr>
              <tr><td>Aset Lainnya</td><td className="right">{formatRupiah(asetLain)}</td></tr>
              <tr><td><strong>Total Aset</strong></td><td className="right"><strong>{formatRupiah(totalAset)}</strong></td></tr>
              <tr><td style={{ color: '#ef4444' }}>Sisa KPR</td><td className="right" style={{ color: '#ef4444' }}>-{formatRupiah(kpr)}</td></tr>
              <tr><td style={{ color: '#ef4444' }}>KTA</td><td className="right" style={{ color: '#ef4444' }}>-{formatRupiah(kta)}</td></tr>
              <tr><td style={{ color: '#ef4444' }}>Kartu Kredit</td><td className="right" style={{ color: '#ef4444' }}>-{formatRupiah(kartuKredit)}</td></tr>
              <tr><td style={{ color: '#ef4444' }}><strong>Total Hutang</strong></td><td className="right" style={{ color: '#ef4444' }}><strong>-{formatRupiah(totalLiabilitas)}</strong></td></tr>
              <tr><td><strong>NET WORTH</strong></td><td className="right" style={{ color: netWorth >= 0 ? 'var(--teal)' : '#ef4444' }}><strong>{formatRupiah(netWorth)}</strong></td></tr>
            </tbody></table>
            <div className="bracket-badge">Debt Ratio: <strong>{debtRatio.toFixed(1)}%</strong> — {debtCategory}</div>
            <div className="action-bar">
              <button type="button" className="action-btn copy" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>📋 Copy</button>
              <button type="button" className="action-btn share" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>🔗 Share</button>
              <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
              <SaveHistoryButton toolId="net-worth" toolName="Net Worth" inputs={{ kas, investasi, properti, kendaraan, asetLain, kpr, kta, kartuKredit, hutangLain }} result={{ netWorth, totalAset, totalLiabilitas, debtRatio }} disabled={!show} />
            </div>
            <p className="result-summary" style={{ marginTop: 12 }}>{debtRecommendation}</p>
            <p className="calc-disclaimer">* Net worth dihitung dari data yang diinput. Nilai aset seperti properti dan kendaraan sebaiknya menggunakan harga pasar terkini untuk hasil yang akurat.</p>
          </div>)}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Net Worth" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="net-worth" /></div>
      <FooterSimple />
    </>
  );
}
