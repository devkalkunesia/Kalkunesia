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
import { formatRupiah, formatNumber, parseNumber, copyResult, shareResult, exportPDF, validateInput, showToast } from '@/lib/utils'
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';

const Chart = dynamic(() => import('react-chartjs-2').then(m => m.Chart), { ssr: false });

const faqItems = [
  { question: 'Apa perbedaan jenis reksa dana?', answer: 'Reksa dana pasar uang (return 4-6%), pendapatan tetap (6-9%), campuran (8-14%), saham (10-20%). Semakin tinggi return potensial, semakin tinggi risikonya.' },
  { question: 'Apakah reksa dana bisa rugi?', answer: 'Ya, terutama reksa dana saham dan campuran. NAB (Nilai Aktiva Bersih) bisa turun saat pasar turun. Reksa dana pasar uang relatif paling stabil.' },
  { question: 'Berapa modal minimum reksa dana?', answer: 'Mulai dari Rp 10.000 — Rp 100.000 tergantung platform. Tersedia di Bibit, Bareksa, Ajaib, dan bank.' },
  { question: 'Apa itu subscription dan redemption fee?', answer: 'Subscription fee = biaya saat beli (0-2%). Redemption fee = biaya saat jual (0-1.5%). Banyak platform kini menawarkan 0% fee.' },
];

const REKSA_DANA_DEFAULTS = {
  modalAwal: 10000000,
  setoranBulanan: 1000000,
  returnTahunan: 12,
  jangkaWaktu: 60,
  subFee: 0,
  redFee: 0,
  typeId: 'campuran',
};

const fundPresets = [
  { id: 'pasar-uang', label: 'Pasar Uang', min: 4, max: 5, avg: 4.5, risk: 'Rendah' },
  { id: 'pendapatan-tetap', label: 'Pendapatan Tetap', min: 6, max: 8, avg: 7, risk: 'Menengah' },
  { id: 'campuran', label: 'Campuran', min: 8, max: 10, avg: 9, risk: 'Menengah-Tinggi' },
  { id: 'saham', label: 'Saham', min: 12, max: 15, avg: 13.5, risk: 'Tinggi' },
];

export default function ReksaDanaPage() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_reksa_dana_inputs', REKSA_DANA_DEFAULTS);
  const { modalAwal, setoranBulanan, returnTahunan, jangkaWaktu, subFee, redFee, typeId } = inputs;
  const setField = (k: string, v: number | string) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartValues, setChartValues] = useState<number[]>([]);
  const [chartSetoran, setChartSetoran] = useState<number[]>([]);
  useScrollReveal(); useBackToTop();
  const selectedPreset = fundPresets.find(p => p.id === typeId) ?? fundPresets[2];
  const resetForm = () => {
    setInputs(REKSA_DANA_DEFAULTS);
    setErrors({});
    setChartLabels([]);
    setChartValues([]);
    setChartSetoran([]);
    setShow(false);
  };
  const handlePresetSelect = (presetId: string) => {
    const preset = fundPresets.find(p => p.id === presetId);
    if (!preset) return;
    setField('typeId', presetId);
    setField('returnTahunan', preset.avg);
  };
  const simulateReturn = (annualReturn: number) => {
    const months = jangkaWaktu;
    const ratePerMonth = annualReturn / 100 / 12;
    const afterSubscription = modalAwal * (1 - subFee / 100);
    const gross = ratePerMonth === 0
      ? afterSubscription + setoranBulanan * months
      : afterSubscription * Math.pow(1 + ratePerMonth, months) + setoranBulanan * (Math.pow(1 + ratePerMonth, months) - 1) / ratePerMonth;
    const redemptionFeeValue = gross * redFee / 100;
    return gross - redemptionFeeValue;
  };
  const comparisonRows = fundPresets.map(preset => ({
    id: preset.id,
    label: preset.label,
    range: `${preset.min}-${preset.max}%`,
    minValue: simulateReturn(preset.min),
    maxValue: simulateReturn(preset.max),
  }));

  useEffect(() => { import('chart.js').then(mod => { mod.Chart.register(mod.LineElement, mod.PointElement, mod.CategoryScale, mod.LinearScale, mod.Filler, mod.Tooltip, mod.Legend); setChartReady(true); }); }, []);

  const r = returnTahunan / 100 / 12;
  const n = jangkaWaktu;
  const modalAfterFee = modalAwal * (1 - subFee / 100);
  let nilaiAkhir: number;
  if (r === 0) {
    nilaiAkhir = modalAfterFee + setoranBulanan * n;
  } else {
    nilaiAkhir = modalAfterFee * Math.pow(1 + r, n) + setoranBulanan * (Math.pow(1 + r, n) - 1) / r;
  }
  const biayaRedempsi = nilaiAkhir * redFee / 100;
  const nilaiSetelahFee = nilaiAkhir - biayaRedempsi;
  const totalSetoran = modalAwal + setoranBulanan * n;
  const totalKeuntungan = nilaiSetelahFee - totalSetoran;
  const returnEfektif = totalSetoran > 0 ? (totalKeuntungan / totalSetoran) * 100 : 0;

  const handleCopy = () => {
    copyResult();
    showToast('✅ Hasil disalin!');
  };

  const handleShare = () => {
    shareResult();
    showToast('🔗 Link berhasil dibagikan!');
  };

  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    const v1 = validateInput(modalAwal, { min: 10000, required: true, label: 'Modal awal' });
    if (v1) e.modalAwal = v1;
    const v2 = validateInput(jangkaWaktu, { min: 1, max: 600, required: true, label: 'Jangka waktu' });
    if (v2) e.jangkaWaktu = v2;
    setErrors(e);
    if (Object.keys(e).length) return;
    void redFee;

    const ratePerMonth = returnTahunan / 100 / 12;
    const months = jangkaWaktu;
    const afterSubscription = modalAwal * (1 - subFee / 100);

    const labels: string[] = [];
    const values: number[] = [];
    const setorans: number[] = [];
    const years = Math.ceil(months / 12);
    for (let y = 0; y <= years; y++) {
      const m = Math.min(y * 12, months);
      labels.push(y === 0 ? 'Awal' : `Thn ${y}`);
      setorans.push(modalAwal + setoranBulanan * m);
      if (ratePerMonth === 0) {
        values.push(afterSubscription + setoranBulanan * m);
      } else {
        values.push(afterSubscription * Math.pow(1 + ratePerMonth, m) + setoranBulanan * (Math.pow(1 + ratePerMonth, m) - 1) / ratePerMonth);
      }
    }
    setChartLabels(labels);
    setChartValues(values);
    setChartSetoran(setorans);
    setShow(true);
  }, [modalAwal, setoranBulanan, returnTahunan, jangkaWaktu, subFee, redFee]);

  useEffect(() => { const t = setTimeout(hitung, 300); return () => clearTimeout(t); }, [hitung]);

  return (
    <>
  <script type="application/ld+json">
    {JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Kalkulator Reksa Dana — Kalkunesia', description: 'Simulasi pertumbuhan investasi reksa dana.', url: 'https://kalkunesia.com/tools/reksa-dana', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' }, provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' } })}
  </script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Reksa Dana" />
      <div className="tool-hero-wrapper">
        <ToolHero icon="💼" badge="📊" title="Kalkulator Reksa Dana" subtitle="Simulasi pertumbuhan investasi reksa dana dengan compound interest dan setoran rutin bulanan." tags={['✓ Compound Interest', '✓ Setoran Rutin', '✓ Grafik', '✓ Gratis']} />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot reksa dana illustration</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle className="robot-antenna" cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8" />
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53" />
            <circle className="robot-eye" cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="35" cy="33" r="2.5" fill="#fff" />
            <circle className="robot-eye" cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="55" cy="33" r="2.5" fill="#fff" />
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6" />
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448" />
            <rect className="robot-badge" x="38" y="60" width="14" height="18" rx="4" fill="#0D9488" opacity="0.8" />
            <text x="45" y="75" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">📊</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <g className="robot-folder">
              <rect x="66" y="48" width="26" height="18" rx="3" fill="#fff" stroke="#0D9488" strokeWidth="1.5" />
              <path d="M70 48V44H86V48" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="70" y1="52" x2="86" y2="52" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="70" y1="56" x2="86" y2="56" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>
      <ToolLayout sidebar={<>
        {/* <AdSenseBox size="rectangle" /> */}
        <TipsCard title="💡 Tips Reksa Dana" items={[{ icon: '📊', text: 'Pasar uang (4-6%), Pendapatan tetap (6-9%), Campuran (8-14%), Saham (10-20%)' }, { icon: '💰', text: 'Setoran rutin (DCA) mengurangi risiko timing market' }, { icon: '📋', text: 'Pilih reksa dana dengan expense ratio rendah' }, { icon: '🏦', text: 'Bandingkan performa 3 tahun terakhir' }]} />
        <RelatedToolsCard items={[{ icon: '📈', name: 'Kalkulator Saham', desc: 'Hitung modal & profit saham', href: '/tools/saham' }, { icon: '💹', name: 'Compound Interest', desc: 'Simulasi bunga berbunga', href: '/tools/compound' }, { icon: '👴', name: 'Dana Pensiun', desc: 'Perencanaan pensiun', href: '/tools/dana-pensiun' }]} />
        <KamusCard terms={[
          { term: 'NAB', def: 'Nilai Aktiva Bersih, harga per unit reksa dana yang berubah setiap hari.' },
          { term: 'Unit Penyertaan', def: 'Satuan kepemilikan reksa dana yang dimiliki investor.' },
          { term: 'Manajer Investasi', def: 'Perusahaan profesional yang mengelola portofolio reksa dana.' },
          { term: 'Expense Ratio', def: 'Biaya pengelolaan tahunan reksa dana, idealnya di bawah 2%.' },
          { term: 'Redemption', def: 'Proses pencairan atau penjualan unit reksa dana.' },
          { term: 'Diversifikasi', def: 'Strategi menyebar investasi ke berbagai aset untuk mengurangi risiko.' },
        ]} />
        <BlogCard posts={[{ title: 'Investasi Pertama? Mulai dari Ini', category: 'Investasi', readTime: '5 menit', slug: 'investasi-pertama-pemula' },{ title: 'Reksa Dana vs Deposito: Mana Lebih Untung?', category: 'Investasi', readTime: '5 menit', slug: 'reksa-dana-vs-deposito' }]} />
      </>}>
        <div className="calc-card">
        <div className="calc-title"><span className="calc-title-dot" />Kalkulator Reksa Dana</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          {fundPresets.map(preset => (
            <button
              key={preset.id}
              type="button"
              className={`mode-btn${selectedPreset.id === preset.id ? ' active' : ''}`}
              style={{ flex: '1 1 135px', textAlign: 'left', padding: 10 }}
              onClick={() => handlePresetSelect(preset.id)}
            >
              <div style={{ fontWeight: 700 }}>{preset.label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{preset.min}-{preset.max}%/tahun</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>{preset.risk} risk</div>
            </button>
          ))}
        </div>
        <div className="input-grid">
            <div className="input-group"><label htmlFor="modalAwal" className="input-label">Modal Awal</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="modalAwal" type="text" inputMode="numeric" className={`calc-input${errors.modalAwal ? ' input-error' : ''}`} value={formatNumber(modalAwal)} onChange={e => { setField('modalAwal', parseNumber(e.target.value)); setErrors({}); }} /></div>{errors.modalAwal && <div className="error-msg">{errors.modalAwal}</div>}</div>
            <div className="input-group"><label htmlFor="setoranBulanan" className="input-label">Setoran Rutin / Bulan</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="setoranBulanan" type="text" inputMode="numeric" className="calc-input" value={formatNumber(setoranBulanan)} onChange={e => setField('setoranBulanan', parseNumber(e.target.value))} /></div></div>
            <div className="input-group"><label htmlFor="returnTahunan" className="input-label">Estimasi Return / Tahun</label><div className="input-wrap"><input id="returnTahunan" type="text" inputMode="numeric" className="calc-input" value={formatNumber(returnTahunan)} onChange={e => setField('returnTahunan', parseNumber(e.target.value))} step={0.5} /><span className="input-suffix">%</span></div></div>
            <div className="input-group"><label htmlFor="jangkaWaktu" className="input-label">Jangka Waktu</label><div className="input-wrap"><input id="jangkaWaktu" type="text" inputMode="numeric" className={`calc-input${errors.jangkaWaktu ? ' input-error' : ''}`} value={jangkaWaktu} onChange={e => { setField('jangkaWaktu', parseNumber(e.target.value)); setErrors({}); }} min={1} max={600} /><span className="input-suffix">bulan</span></div>{errors.jangkaWaktu && <div className="error-msg">{errors.jangkaWaktu}</div>}</div>
            <div className="input-group"><label htmlFor="subscriptionFee" className="input-label">Subscription Fee (%)</label><div className="input-wrap"><input id="subscriptionFee" type="text" inputMode="numeric" className="calc-input" value={formatNumber(subFee)} onChange={e => setField('subFee', parseNumber(e.target.value))} step={0.1} /><span className="input-suffix">%</span></div></div>
            <div className="input-group"><label htmlFor="redemptionFee" className="input-label">Redemption Fee (%)</label><div className="input-wrap"><input id="redemptionFee" type="text" inputMode="numeric" className="calc-input" value={formatNumber(redFee)} onChange={e => setField('redFee', parseNumber(e.target.value))} step={0.1} /><span className="input-suffix">%</span></div></div>
          </div>
          {show && (<div>
            <div className="result-divider" />
            <div className="result-title-label">Proyeksi Investasi Reksa Dana</div>
            <div className="result-grid">
              <div className="result-card highlight"><div className="result-label">Nilai Akhir</div><div className="result-value">{formatRupiah(nilaiSetelahFee)}</div><div className="result-sub">Setelah {(jangkaWaktu / 12).toFixed(1)} tahun</div></div>
              <div className="result-card"><div className="result-label">Total Setoran</div><div className="result-value">{formatRupiah(totalSetoran)}</div><div className="result-sub">Modal + setoran rutin</div></div>
              <div className="result-card"><div className="result-label">Total Keuntungan</div><div className="result-value" style={{ color: totalKeuntungan >= 0 ? '#2DD4BF' : '#ef4444' }}>{totalKeuntungan >= 0 ? '+' : ''}{formatRupiah(totalKeuntungan)}</div><div className="result-sub">Return: {returnEfektif.toFixed(1)}%</div></div>
            </div>
            <div className="bracket-badge">Return Efektif: <strong>{returnEfektif >= 0 ? '+' : ''}{returnEfektif.toFixed(1)}%</strong> dari total setoran</div>
            <div className="bracket-badge">Simulasi DCA bulanan: {formatRupiah(setoranBulanan)} x {jangkaWaktu} bulan ({selectedPreset.label})</div>
            {chartReady && chartLabels.length > 0 && (
              <div className="chart-section show">
                <div style={{ height: 260 }}>
                  <Chart type="line" data={{ labels: chartLabels, datasets: [{ label: 'Nilai Investasi', data: chartValues, borderColor: '#0D9488', backgroundColor: 'rgba(13,148,136,.1)', fill: true, tension: .4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#0D9488' }, { label: 'Total Setoran', data: chartSetoran, borderColor: '#1B3C53', backgroundColor: 'rgba(27,60,83,.05)', fill: true, tension: .4, borderWidth: 2, pointRadius: 2, pointBackgroundColor: '#1B3C53', borderDash: [5, 5] }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 11, weight: 'bold' } } } }, scales: { y: { ticks: { callback: (v: number | string) => 'Rp ' + (Number(v) / 1e6).toFixed(0) + 'jt', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,.05)' } }, x: { ticks: { font: { size: 9 } }, grid: { display: false } } } } as never} />
                </div>
              </div>
            )}
            <div style={{ marginTop: 24 }}>
              <div className="result-title-label" style={{ marginBottom: 12 }}>Perbandingan Jenis Reksa Dana</div>
              <table className="result-table">
                <thead>
                  <tr><th>Jenis</th><th>Return / Tahun</th><th>Estimasi Minimal</th><th>Estimasi Maksimal</th></tr>
                </thead>
                <tbody>
                  {comparisonRows.map(row => (
                    <tr key={row.id}>
                      <td>{row.label}</td>
                      <td>{row.range}</td>
                      <td className="right">{formatRupiah(row.minValue)}</td>
                      <td className="right">{formatRupiah(row.maxValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="action-bar">
              <button type="button" className="action-btn reset" onClick={resetForm}>🔄 Reset</button>
              <button type="button" className="action-btn copy" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>📋 Copy Hasil</button>
              <button type="button" className="action-btn share" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>🔗 Share</button>
              <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
              <SaveHistoryButton toolId="reksa-dana" toolName="Kalkulator Reksa Dana" inputs={{ modalAwal, setoranBulanan, returnTahunan, jangkaWaktu, typeId }} result={{ nilaiAkhir: nilaiSetelahFee, totalSetoran, totalKeuntungan }} disabled={!show} />
            </div>
            <p className="calc-disclaimer">* Proyeksi berdasarkan return konstan yang diasumsikan. Return reksa dana aktual fluktuatif dan tidak dijamin. Reksa dana bukan produk bank dan tidak dijamin LPS. Baca prospektus sebelum berinvestasi.</p>
          </div>)}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Reksa Dana" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="reksa-dana" /></div>
      <FooterSimple />
    </>
  );
}
