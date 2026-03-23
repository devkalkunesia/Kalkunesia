'use client';
import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import ToolHero from '@/components/ToolHero';
import ToolLayout from '@/components/ToolLayout';
// import AdSenseBox from '@/components/AdSenseBox';
import FaqSection from '@/components/FaqSection';
import MoreTools from '@/components/MoreTools';
import { TipsCard, RelatedToolsCard, BlogCard, KamusCard } from '@/components/SidebarCards';
import { FooterSimple } from '@/components/Footer';
import SaveHistoryButton from '@/components/SaveHistoryButton';
import { formatRupiah, formatNumber, parseNumber, copyResult, shareResult, exportPDF, validateInput, showToast } from '@/lib/utils'
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';

const Chart = dynamic(() => import('react-chartjs-2').then(m => m.Chart), { ssr: false });

const faqItems = [
  { question: 'Kapan sebaiknya mulai menabung pensiun?', answer: 'Sekarang! Semakin awal mulai, semakin kecil setoran bulanan yang diperlukan berkat efek bunga berbunga (compound interest).' },
  { question: 'Berapa dana pensiun yang ideal?', answer: 'Umumnya 70-80% dari pengeluaran saat ini (adjusted inflasi) selama 20-25 tahun. Ini mencakup biaya hidup, kesehatan, dan gaya hidup.' },
  { question: 'Apa itu DPLK?', answer: 'DPLK (Dana Pensiun Lembaga Keuangan) adalah program pensiun yang dikelola bank/asuransi. Iuran bisa menjadi pengurang pajak penghasilan.' },
  { question: 'Instrumen apa yang cocok?', answer: 'Jangka panjang: reksa dana saham, ETF. Jangka menengah: reksa dana campuran. Dekat pensiun: deposito, obligasi, reksa dana pasar uang.' },
];

export default function DanaPensiunPage() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_dana_pensiun_inputs', {
    usia: 30, usiaPensiun: 55, pengeluaran: 8000000, inflasi: 3.5, returnInvest: 8, tabunganAda: 50000000, tahunBertahan: 20,
  });
  const { usia, usiaPensiun, pengeluaran, inflasi, returnInvest, tabunganAda, tahunBertahan } = inputs;
  const setField = (k: string, v: number) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartProyeksi, setChartProyeksi] = useState<number[]>([]);
  const [chartTarget, setChartTarget] = useState<number[]>([]);
  useScrollReveal(); useBackToTop();

  useEffect(() => { import('chart.js').then(mod => { mod.Chart.register(mod.LineElement, mod.PointElement, mod.CategoryScale, mod.LinearScale, mod.Filler, mod.Tooltip, mod.Legend); setChartReady(true); }); }, []);

  const tahunHinggaPensiun = Math.max(0, usiaPensiun - usia);
  const pengeluaranPensiun = pengeluaran * Math.pow(1 + inflasi / 100, tahunHinggaPensiun);
  const totalDanaButuh = pengeluaranPensiun * 12 * tahunBertahan;
  const rBulanan = returnInvest / 100 / 12;
  const nBulan = tahunHinggaPensiun * 12;
  const fvTabungan = rBulanan > 0 ? tabunganAda * Math.pow(1 + rBulanan, nBulan) : tabunganAda;
  const gap = Math.max(0, totalDanaButuh - fvTabungan);
  let setoranBulanan = 0;
  if (gap > 0 && nBulan > 0) {
    if (rBulanan > 0) { setoranBulanan = gap * rBulanan / (Math.pow(1 + rBulanan, nBulan) - 1); }
    else { setoranBulanan = gap / nBulan; }
  }

  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    const v1 = validateInput(usia, { min: 18, max: 70, required: true, label: 'Usia' });
    if (v1) e.usia = v1;
    const v2 = validateInput(usiaPensiun, { min: usia + 1, max: 80, required: true, label: 'Usia pensiun' });
    if (v2) e.usiaPensiun = v2;
    const v3 = validateInput(pengeluaran, { min: 1000000, required: true, label: 'Pengeluaran' });
    if (v3) e.pengeluaran = v3;
    setErrors(e);
    if (Object.keys(e).length) return;

    const labels: string[] = []; const proyeksi: number[] = []; const targets: number[] = [];
    for (let y = 0; y <= tahunHinggaPensiun; y++) {
      labels.push(y === 0 ? `Usia ${usia}` : `${usia + y}`);
      const m = y * 12;
      let fv = rBulanan > 0 ? tabunganAda * Math.pow(1 + rBulanan, m) + setoranBulanan * (Math.pow(1 + rBulanan, m) - 1) / rBulanan : tabunganAda + setoranBulanan * m;
      proyeksi.push(fv);
      targets.push(totalDanaButuh);
    }
    setChartLabels(labels); setChartProyeksi(proyeksi); setChartTarget(targets);
    setShow(true);
  }, [usia, usiaPensiun, pengeluaran, tabunganAda, tahunHinggaPensiun, rBulanan, setoranBulanan, totalDanaButuh]);

  useEffect(() => { const t = setTimeout(hitung, 300); return () => clearTimeout(t); }, [hitung]);

  return (
    <>
      <Script id="dana-pensiun-ld" type="application/ld+json">
        {JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Kalkulator Dana Pensiun — Kalkunesia', description: 'Hitung kebutuhan dana pensiun.', url: 'https://kalkunesia.com/tools/dana-pensiun', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' }, provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' } })}
      </Script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Dana Pensiun" />
      <div className="tool-hero-wrapper">
        <ToolHero icon="👴" badge="PENSIUN" title="Kalkulator Dana Pensiun" subtitle="Hitung kebutuhan dana pensiun, proyeksi inflasi, dan setoran bulanan yang diperlukan untuk pensiun nyaman." tags={['✓ Inflasi', '✓ Compound Interest', '✓ Grafik', '✓ Gratis']} />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot dana pensiun</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle className="robot-antenna" cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8" />
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53" />
            <circle className="robot-eye" cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="35" cy="33" r="2.5" fill="#fff" />
            <circle className="robot-eye" cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="55" cy="33" r="2.5" fill="#fff" />
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6" />
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448" />
            <rect className="robot-badge" x="36" y="62" width="18" height="18" rx="4" fill="#0D9488" opacity="0.8" />
            <text x="45" y="75" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">55</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <g className="robot-calendar">
              <rect x="68" y="44" width="20" height="20" rx="3" fill="#fff" stroke="#0D9488" strokeWidth="1.5" />
              <line x1="68" y1="50" x2="88" y2="50" stroke="#0D9488" strokeWidth="1.2" />
              <line x1="74" y1="44" x2="74" y2="48" stroke="#0D9488" strokeWidth="1.2" />
              <line x1="82" y1="44" x2="82" y2="48" stroke="#0D9488" strokeWidth="1.2" />
            </g>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>
      <ToolLayout
        sidebar={
          <>
            {/* <AdSenseBox size="rectangle" /> */}
            <TipsCard title="💡 Tips Pensiun" items={[
              { icon: '⏰', text: 'Mulai sekarang — efek compound interest membutuhkan waktu' },
              { icon: '📈', text: 'Jangka panjang: reksa dana saham atau ETF indeks' },
              { icon: '🏦', text: 'DPLK bisa mengurangi pajak penghasilan' },
              { icon: '💰', text: 'Target: 70-80% pengeluaran saat ini × tahun bertahan' },
            ]} />
            <RelatedToolsCard items={[
              { icon: '💼', name: 'Reksa Dana', desc: 'Simulasi reksa dana', href: '/tools/reksa-dana' },
              { icon: '🛡️', name: 'Dana Darurat', desc: 'Target dana darurat', href: '/tools/dana-darurat' },
              { icon: '💹', name: 'Compound Interest', desc: 'Bunga berbunga', href: '/tools/compound' },
            ]} />
            <KamusCard terms={[
              { term: 'Dana Pensiun', def: 'Tabungan jangka panjang untuk membiayai hidup setelah berhenti bekerja.' },
              { term: 'DPLK', def: 'Dana Pensiun Lembaga Keuangan, program pensiun dari bank atau asuransi.' },
              { term: 'Inflasi', def: 'Kenaikan harga rata-rata yang menurunkan daya beli uang dari waktu ke waktu.' },
              { term: 'Compound Interest', def: 'Bunga berbunga yang membuat investasi tumbuh eksponensial.' },
              { term: 'Replacement Ratio', def: 'Persentase penghasilan aktif yang perlu diganti setelah pensiun.' },
              { term: 'Annuity', def: 'Pembayaran berkala tetap dari dana pensiun setelah masa pensiun dimulai.' },
            ]} />
            <BlogCard posts={[
              { title: 'Investasi Pertama? Mulai dari Ini', category: 'Investasi', readTime: '5 menit', slug: 'investasi-pertama-pemula' },
              { title: 'Reksa Dana vs Deposito: Mana Lebih Untung?', category: 'Investasi', readTime: '5 menit', slug: 'reksa-dana-vs-deposito' },
            ]} />
          </>
        }
      >
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />Kalkulator Dana Pensiun</div>
          <div className="input-grid">
            <div className="input-group"><label htmlFor="usia" className="input-label">Usia Saat Ini</label><div className="input-wrap"><input id="usia" type="text" inputMode="numeric" className={`calc-input${errors.usia ? ' input-error' : ''}`} value={usia} onChange={e => { setField('usia', parseNumber(e.target.value)); setErrors({}); }} min={18} max={70} /><span className="input-suffix">tahun</span></div>{errors.usia && <div className="error-msg">{errors.usia}</div>}</div>
            <div className="input-group"><label htmlFor="usia-pensiun" className="input-label">Usia Pensiun Target</label><div className="input-wrap"><input id="usia-pensiun" type="text" inputMode="numeric" className={`calc-input${errors.usiaPensiun ? ' input-error' : ''}`} value={usiaPensiun} onChange={e => { setField('usiaPensiun', parseNumber(e.target.value)); setErrors({}); }} min={35} max={80} /><span className="input-suffix">tahun</span></div>{errors.usiaPensiun && <div className="error-msg">{errors.usiaPensiun}</div>}</div>
            <div className="input-group full"><label htmlFor="pengeluaran" className="input-label">Pengeluaran Bulanan Saat Ini</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="pengeluaran" type="text" inputMode="numeric" className={`calc-input${errors.pengeluaran ? ' input-error' : ''}`} value={formatNumber(pengeluaran)} onChange={e => { setField('pengeluaran', parseNumber(e.target.value)); setErrors({}); }} /></div>{errors.pengeluaran && <div className="error-msg">{errors.pengeluaran}</div>}</div>
            <div className="input-group"><label htmlFor="inflasi" className="input-label">Inflasi / Tahun</label><div className="input-wrap"><input id="inflasi" type="text" inputMode="numeric" className="calc-input" value={formatNumber(inflasi)} onChange={e => setField('inflasi', parseNumber(e.target.value))} step={0.5} /><span className="input-suffix">%</span></div></div>
            <div className="input-group"><label htmlFor="return-investasi" className="input-label">Return Investasi / Tahun</label><div className="input-wrap"><input id="return-investasi" type="text" inputMode="numeric" className="calc-input" value={formatNumber(returnInvest)} onChange={e => setField('returnInvest', parseNumber(e.target.value))} step={0.5} /><span className="input-suffix">%</span></div></div>
            <div className="input-group"><label htmlFor="tabungan" className="input-label">Tabungan Pensiun yang Ada</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="tabungan" type="text" inputMode="numeric" className="calc-input" value={formatNumber(tabunganAda)} onChange={e => setField('tabunganAda', parseNumber(e.target.value))} /></div></div>
            <div className="input-group"><label htmlFor="tahun-bertahan" className="input-label">Dana Bertahan Setelah Pensiun</label><div className="input-wrap"><input id="tahun-bertahan" type="text" inputMode="numeric" className="calc-input" value={formatNumber(tahunBertahan)} onChange={e => setField('tahunBertahan', parseNumber(e.target.value))} min={5} max={40} /><span className="input-suffix">tahun</span></div></div>
          </div>
          {show && (<div>
            <div className="result-divider" />
            <div className="result-title-label">Proyeksi Dana Pensiun</div>
            <div className="result-grid">
              <div className="result-card highlight"><div className="result-label">Setoran Bulanan Diperlukan</div><div className="result-value">{formatRupiah(setoranBulanan)}</div><div className="result-sub">Selama {tahunHinggaPensiun} tahun</div></div>
              <div className="result-card"><div className="result-label">Total Dana Dibutuhkan</div><div className="result-value">{formatRupiah(totalDanaButuh)}</div><div className="result-sub">Untuk {tahunBertahan} tahun pensiun</div></div>
              <div className="result-card"><div className="result-label">Pengeluaran Saat Pensiun</div><div className="result-value">{formatRupiah(pengeluaranPensiun)}</div><div className="result-sub">/bulan (adjusted inflasi {inflasi}%)</div></div>
            </div>
            <div className="bracket-badge">Setoran Bulanan: <strong>{formatRupiah(setoranBulanan)}</strong> — {tahunHinggaPensiun} tahun lagi menuju pensiun</div>
            <table className="result-table"><thead><tr><th>Komponen</th><th>Nilai</th></tr></thead><tbody>
              <tr><td>Waktu hingga pensiun</td><td className="right">{tahunHinggaPensiun} tahun ({nBulan} bulan)</td></tr>
              <tr><td>Pengeluaran sekarang</td><td className="right">{formatRupiah(pengeluaran)}/bulan</td></tr>
              <tr><td>Pengeluaran saat pensiun</td><td className="right">{formatRupiah(pengeluaranPensiun)}/bulan</td></tr>
              <tr><td>Total kebutuhan</td><td className="right">{formatRupiah(totalDanaButuh)}</td></tr>
              <tr><td>Proyeksi tabungan yang ada</td><td className="right">{formatRupiah(fvTabungan)}</td></tr>
              <tr><td>Kekurangan</td><td className="right">{formatRupiah(gap)}</td></tr>
              <tr><td><strong>Setoran / bulan</strong></td><td className="right"><strong>{formatRupiah(setoranBulanan)}</strong></td></tr>
            </tbody></table>
            {chartReady && chartLabels.length > 0 && (
              <div className="chart-section show">
                <div style={{ height: 260 }}>
                  <Chart type="line" data={{ labels: chartLabels, datasets: [{ label: 'Proyeksi Tabungan', data: chartProyeksi, borderColor: '#0D9488', backgroundColor: 'rgba(13,148,136,.1)', fill: true, tension: .4, borderWidth: 2, pointRadius: 2, pointBackgroundColor: '#0D9488' }, { label: 'Target Dana', data: chartTarget, borderColor: '#ef4444', borderWidth: 2, borderDash: [8, 4], pointRadius: 0, fill: false }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 11, weight: 'bold' } } } }, scales: { y: { ticks: { callback: (v: number | string) => 'Rp ' + (Number(v) / 1e9).toFixed(1) + 'M', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,.05)' } }, x: { ticks: { font: { size: 9 }, maxTicksLimit: 10 }, grid: { display: false } } } } as never} />
                </div>
              </div>
            )}
            <div className="action-bar">
              <button type="button" className="action-btn copy" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>📋 Copy</button>
              <button type="button" className="action-btn share" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>🔗 Share</button>
              <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
              <SaveHistoryButton toolId="dana-pensiun" toolName="Dana Pensiun" inputs={{ usia, usiaPensiun, pengeluaran, inflasi, returnInvest, tabunganAda }} result={{ setoranBulanan, totalDanaButuh, gap, pengeluaranPensiun }} disabled={!show} />
            </div>
            <p className="calc-disclaimer">* Proyeksi bersifat estimasi menggunakan asumsi return dan inflasi konstan. Return investasi aktual dapat berbeda. Konsultasikan dengan perencana keuangan bersertifikat untuk perencanaan pensiun yang komprehensif.</p>
          </div>)}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Dana Pensiun" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="dana-pensiun" /></div>
      <FooterSimple />
    </>
  );
}
