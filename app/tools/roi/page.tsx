'use client';
import { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import ToolHero from '@/components/ToolHero';
import ToolLayout from '@/components/ToolLayout';
import AdSenseBox from '@/components/AdSenseBox';
import FaqSection from '@/components/FaqSection';
import MoreTools from '@/components/MoreTools';
import { TipsCard, RelatedToolsCard, BlogCard, KamusCard } from '@/components/SidebarCards';
import { FooterSimple } from '@/components/Footer';
import { formatRupiah, formatNumber, parseNumber, copyResult, shareResult, exportPDF, validateInput, showToast } from '@/lib/utils'
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';
import SaveHistoryButton from '@/components/SaveHistoryButton';

const faqItems = [
  { question: 'Berapa ROI yang dianggap bagus?', answer: 'ROI di atas 10-15% per tahun umumnya dianggap baik, lebih tinggi dari rata-rata deposito (~5%) dan inflasi (~3-5%). Saham blue chip historis memberikan 10-15%/tahun.' },
  { question: 'Apa bedanya ROI dan profit?', answer: 'Profit adalah keuntungan absolut (dalam Rupiah), sedangkan ROI adalah persentase keuntungan relatif terhadap modal. ROI lebih berguna untuk membandingkan berbagai peluang investasi.' },
  { question: 'Apakah ROI sudah memperhitungkan inflasi?', answer: 'Kalkulator ini menghitung ROI nominal (sebelum inflasi). Untuk ROI riil, kurangi dengan tingkat inflasi tahunan (~3-5%). Contoh: ROI 15% - inflasi 4% = ROI riil ~11%.' },
  { question: 'Bagaimana menghitung ROI bisnis?', answer: 'Modal = total investasi awal. Nilai akhir = total pendapatan. Biaya tambahan = biaya operasional. Masukkan semua ke kalkulator untuk mendapat ROI bisnis kamu.' },
];

const ROI_DEFAULTS = {
  modal: 50000000,
  nilaiAkhir: 75000000,
  biaya: 0,
  durasi: 2,
  inflasi: 3.5,
};

const roiTerms = [
  { term: 'ROI', def: 'Return on Investment, persentase keuntungan relatif terhadap modal yang ditanamkan.' },
  { term: 'Net Profit', def: 'Keuntungan bersih setelah dikurangi semua biaya dan modal awal.' },
  { term: 'Break Even', def: 'Titik impas di mana pendapatan sama dengan total modal yang dikeluarkan.' },
  { term: 'Annualized ROI', def: 'ROI yang disetarakan per tahun untuk memudahkan perbandingan.' },
  { term: 'IRR', def: 'Internal Rate of Return, tingkat pengembalian yang membuat NPV investasi menjadi nol.' },
  { term: 'Payback Period', def: 'Waktu yang dibutuhkan untuk mendapatkan kembali modal investasi awal.' },
];

export default function RoiPage() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_roi_inputs', ROI_DEFAULTS);
  const { modal, nilaiAkhir, biaya, durasi, inflasi } = inputs;
  const setField = (k: string, v: number) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<'simple' | 'cagr'>('cagr');
  useScrollReveal(); useBackToTop();

  const resetForm = () => {
    setInputs(ROI_DEFAULTS);
    setMode('cagr');
    setErrors({});
    setShow(false);
  };

  const totalModal = modal + biaya;
  const netProfit = nilaiAkhir - totalModal;
  const simpleRoi = totalModal > 0 ? (netProfit / totalModal) * 100 : 0;
  const roiTahunan = totalModal > 0 && durasi > 0 ? (Math.pow(nilaiAkhir / totalModal, 1 / durasi) - 1) * 100 : 0;
  const roiCategory = roiTahunan >= 15 ? '🟢 Sangat Baik' : roiTahunan >= 10 ? '🟡 Baik' : roiTahunan >= 5 ? '🟠 Cukup' : '🔴 Kurang';

  const hitung = useCallback(() => {
    const validation: Record<string, string> = {};
    const v1 = validateInput(modal, { min: 1, required: true, label: 'Modal awal' });
    if (v1) validation.modal = v1;
    const v2 = validateInput(durasi, { min: 0.1, required: true, label: 'Durasi' });
    if (v2) validation.durasi = v2;
    const v4 = validateInput(inflasi, { min: 0, max: 15, required: true, label: 'Inflasi' });
    if (v4) validation.inflasi = v4;
    setErrors(validation);
    if (Object.keys(validation).length) {
      setShow(false);
      return;
    }
    setShow(true);
  }, [modal, durasi, inflasi]);

  useEffect(() => {
    const timer = setTimeout(hitung, 300);
    return () => clearTimeout(timer);
  }, [hitung]);

  const realRoi = roiTahunan - inflasi;
  const yearCount = Math.max(1, Math.ceil(durasi));
  const growthRows = Array.from({ length: yearCount }, (_, idx) => {
    const year = idx + 1;
    const simpleValue = totalModal + netProfit * Math.min(year, durasi) / Math.max(durasi, 1);
    const cagrValue = totalModal * Math.pow(1 + roiTahunan / 100, year);
    const projected = mode === 'cagr' ? cagrValue : simpleValue;
    const inflasiValue = totalModal * Math.pow(1 + inflasi / 100, year);
    return {
      year,
      projected,
      inflasiValue,
      diff: projected - inflasiValue,
    };
  });
  const detailRows = [
    { label: 'Modal Awal', val: formatRupiah(modal) },
    { label: 'Biaya Tambahan', val: formatRupiah(biaya) },
    { label: 'Total Modal', val: formatRupiah(totalModal) },
    { label: 'Nilai Akhir', val: formatRupiah(nilaiAkhir) },
    { label: 'Net Profit', val: formatRupiah(netProfit) },
    { label: 'Inflasi (asumsi)', val: `${inflasi.toFixed(1)}%` },
    { label: 'ROI Riil / Tahun', val: `${realRoi.toFixed(2)}%` },
  ];

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Kalkulator ROI — Kalkunesia',
          description: 'Hitung return on investment dari bisnis, saham, atau properti.',
          url: 'https://kalkunesia.com/tools/roi',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web Browser',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
          provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
        })}
      </script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="ROI Calculator" />
      <div className="tool-hero-wrapper">
        <ToolHero icon="📈" badge="ROI" title="ROI Calculator" subtitle="Hitung Return on Investment (ROI) dari bisnis, properti, saham, atau investasi apapun secara cepat dan akurat." tags={['ROI Tahunan', 'Perbandingan Investasi', 'Multi Skema', 'Gratis']} />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot ROI calculator illustration</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round"/>
            <circle className="robot-antenna" cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8"/>
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53"/>
            <circle className="robot-eye" cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9"/>
            <circle className="robot-eye" cx="35" cy="33" r="2.5" fill="#fff"/>
            <circle className="robot-eye" cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9"/>
            <circle className="robot-eye" cx="55" cy="33" r="2.5" fill="#fff"/>
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6"/>
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448"/>
            <rect className="robot-badge" x="38" y="62" width="14" height="18" rx="4" fill="#0D9488" opacity="0.8"/>
            <text x="45" y="75" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">ROI</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448"/>
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448"/>
            <g className="robot-calculator">
              <rect x="70" y="46" width="24" height="28" rx="4" fill="#fff" stroke="#0D9488" strokeWidth="1.5" />
              <rect x="74" y="50" width="16" height="4" rx="2" fill="#0D9488" opacity="0.4" />
              <rect x="74" y="56" width="16" height="4" rx="2" fill="#0D9488" opacity="0.4" />
              <rect x="74" y="62" width="16" height="4" rx="2" fill="#0D9488" opacity="0.4" />
              <rect x="76" y="70" width="12" height="10" rx="2" fill="#0D9488" opacity="0.7" />
            </g>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53"/>
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53"/>
          </svg>
        </div>
      </div>
      <ToolLayout
        sidebar={
          <>
            {/* <AdSenseBox size="rectangle" /> */}
            <TipsCard title="💡 Tips Investasi" items={[
              { icon: '📊', text: 'ROI > 15%/tahun — Umumnya investasi dianggap baik jika ROI tahunan di atas 15%.' },
              { icon: '⚠️', text: 'Risk vs Return — ROI tinggi selalu disertai risiko lebih tinggi. Diversifikasi!' },
              { icon: '💡', text: 'Bandingkan dengan inflasi — ROI harus melebihi inflasi (~3-5%) agar investasi nyata menguntungkan.' },
              { icon: '🏦', text: 'Perhatikan biaya tersembunyi — Biaya admin, pajak, dan komisi bisa memangkas ROI signifikan.' },
            ]} />
            <RelatedToolsCard items={[
              { icon: '💹', name: 'Compound Interest', desc: 'Simulasi bunga berbunga', href: '/tools/compound' },
              { icon: '🏠', name: 'KPR Calculator', desc: 'Analisis properti', href: '/tools/kpr' },
              { icon: '📊', name: 'Budget Planner', desc: 'Rencanakan investasi bulanan', href: '/tools/budget' },
            ]} />
            <KamusCard terms={roiTerms} />
            <BlogCard posts={[
              { title: 'Investasi Pertama? Mulai dari Ini', category: 'Investasi', readTime: '5 menit', slug: 'investasi-pertama-pemula' },
              { title: 'Reksa Dana vs Deposito: Mana Lebih Untung?', category: 'Investasi', readTime: '5 menit', slug: 'reksa-dana-vs-deposito' },
            ]} />
          </>
        }
      >
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />ROI Calculator</div>
          <div className="input-grid">
            <div className="input-group">
              <label htmlFor="modalAwal" className="input-label">Modal Awal (Investasi)</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input
                  id="modalAwal"
                  type="text"
                  inputMode="numeric"
                  className={`calc-input has-prefix${errors.modal ? ' input-error' : ''}`}
                  value={formatNumber(modal)}
                  onChange={e => { setField('modal', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, modal: '' })); }}
                />
              </div>
              <input
                type="range"
                className="slider"
                min={1000000}
                max={1000000000}
                step={1000000}
                value={modal}
                onChange={e => setField('modal', parseNumber(e.target.value))}
              />
              <div className="slider-labels"><span>Rp 1jt</span><span>Rp 1M</span></div>
              {errors.modal && <div className="error-msg">{errors.modal}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="nilaiAkhir" className="input-label">Nilai Akhir / Keuntungan</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input
                  id="nilaiAkhir"
                  type="text"
                  inputMode="numeric"
                  className="calc-input has-prefix"
                  value={formatNumber(nilaiAkhir)}
                  onChange={e => setField('nilaiAkhir', parseNumber(e.target.value))}
                />
              </div>
              <input
                type="range"
                className="slider"
                min={1000000}
                max={2000000000}
                step={1000000}
                value={nilaiAkhir}
                onChange={e => setField('nilaiAkhir', parseNumber(e.target.value))}
              />
              <div className="slider-labels"><span>Rp 1jt</span><span>Rp 2M</span></div>
            </div>
            <div className="input-group">
              <label htmlFor="biayaTambahan" className="input-label">Biaya Tambahan</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input
                  id="biayaTambahan"
                  type="text"
                  inputMode="numeric"
                  className="calc-input has-prefix"
                  value={formatNumber(biaya)}
                  onChange={e => setField('biaya', parseNumber(e.target.value))}
                />
              </div>
              <input
                type="range"
                className="slider"
                min={0}
                max={100000000}
                step={500000}
                value={biaya}
                onChange={e => setField('biaya', parseNumber(e.target.value))}
              />
              <div className="slider-labels"><span>Rp 0</span><span>Rp 100jt</span></div>
            </div>
            <div className="input-group">
              <label htmlFor="durasiInvestasi" className="input-label">Durasi Investasi</label>
              <div className="input-wrap">
                <input
                  id="durasiInvestasi"
                  type="text"
                  inputMode="numeric"
                  className={`calc-input${errors.durasi ? ' input-error' : ''}`}
                  value={durasi}
                  onChange={e => { setField('durasi', +e.target.value || 1); setErrors(prev => ({ ...prev, durasi: '' })); }}
                  min={0.1}
                  step={0.1}
                />
                <span className="input-suffix">Tahun</span>
              </div>
              <input
                type="range"
                className="slider"
                min={1}
                max={30}
                step={1}
                value={durasi}
                onChange={e => setField('durasi', parseNumber(e.target.value))}
              />
              <div className="slider-labels"><span>1 thn</span><span>30 thn</span></div>
              {errors.durasi && <div className="error-msg">{errors.durasi}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="inflasiTahunan" className="input-label">Inflasi / Tahun</label>
              <div className="input-wrap">
                <input
                  id="inflasiTahunan"
                  type="text"
                  inputMode="numeric"
                  className={`calc-input${errors.inflasi ? ' input-error' : ''}`}
                  value={formatNumber(inflasi)}
                  onChange={e => { setField('inflasi', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, inflasi: '' })); }}
                />
                <span className="input-suffix">%</span>
              </div>
              <input
                type="range"
                className="slider"
                min={0}
                max={15}
                step={0.1}
                value={inflasi}
                onChange={e => setField('inflasi', parseNumber(e.target.value))}
              />
              <div className="slider-labels"><span>0%</span><span>15%</span></div>
              {errors.inflasi && <div className="error-msg">{errors.inflasi}</div>}
            </div>
          </div>
          {show && (
            <div>
              <div className="result-divider" />
              <div className="result-title-label">Hasil Analisis ROI</div>
              <div className="mode-tabs">
                <div className="mode-tabs-label">Mode Analisis</div>
                <div className="mode-tabs-buttons">
                  <button type="button" className={`mode-btn${mode === 'simple' ? ' active' : ''}`} onClick={() => setMode('simple')}>Simple ROI</button>
                  <button type="button" className={`mode-btn${mode === 'cagr' ? ' active' : ''}`} onClick={() => setMode('cagr')}>CAGR / Annualized</button>
                </div>
              </div>
              <div className="result-grid">
                <div className="result-card highlight">
                  <div className="result-label">ROI Total</div>
                  <div className={`result-value${simpleRoi < 0 ? ' value-negative' : ''}`}>{simpleRoi.toFixed(2)}%</div>
                  <div className="result-sub">Return total investasi</div>
                </div>
                <div className="result-card">
                  <div className="result-label">ROI per Tahun</div>
                  <div className={`result-value${roiTahunan < 0 ? ' value-negative' : ''}`}>{roiTahunan.toFixed(2)}%/thn</div>
                  <div className="result-sub">Annualized ROI</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Real ROI vs Inflasi</div>
                  <div className={`result-value${realRoi < 0 ? ' value-negative' : ''}`}>{realRoi.toFixed(2)}%/thn</div>
                  <div className="result-sub">Inflasi {inflasi.toFixed(1)}%</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Mode Aktif</div>
                  <div className="result-value">{mode === 'cagr' ? 'CAGR' : 'Simple'} — {mode === 'cagr' ? `${roiTahunan.toFixed(2)}%/thn` : `${simpleRoi.toFixed(2)}%`}</div>
                  <div className="result-sub">{roiCategory}</div>
                </div>
              </div>
              <div className="bracket-badge">{mode === 'cagr' ? 'CAGR' : 'ROI Total'} vs Inflasi: <strong>{realRoi.toFixed(2)}%</strong> ({realRoi >= 0 ? 'Mengalahkan inflasi' : 'Dibawah inflasi'})</div>
              <table className="result-table">
                <thead>
                  <tr><th>Detail</th><th>Nilai</th></tr>
                </thead>
                <tbody>
                  {detailRows.map(r => (
                    <tr key={r.label}>
                      <td>{r.label}</td>
                      <td className="right">{r.val}</td>
                    </tr>
                  ))}
                  <tr><td>ROI Total</td><td className={`right${simpleRoi < 0 ? ' negative' : ''}`}>{simpleRoi.toFixed(2)}%</td></tr>
                  <tr><td>ROI Tahunan</td><td className={`right${roiTahunan < 0 ? ' negative' : ''}`}>{roiTahunan.toFixed(2)}%/thn</td></tr>
                  <tr><td>Net Profit</td><td className={`right${netProfit < 0 ? ' negative' : ''}`}>{formatRupiah(netProfit)}</td></tr>
                </tbody>
              </table>
              <div className="growth-section">
                <div className="growth-header">Perkiraan Pertumbuhan Tahunan ({mode === 'cagr' ? 'CAGR' : 'Simple ROI'})</div>
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>Tahun</th>
                      <th>Nilai Proyeksi</th>
                      <th>Inflasi</th>
                      <th>Selisih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {growthRows.map(row => (
                      <tr key={row.year}>
                        <td>Tahun {row.year}</td>
                        <td className="right">{formatRupiah(row.projected)}</td>
                        <td className="right">{formatRupiah(row.inflasiValue)}</td>
                        <td className={`right${row.diff < 0 ? ' negative' : ''}`}>{formatRupiah(row.diff)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="action-bar">
                <button className="action-btn reset" type="button" onClick={resetForm}>🔄 Reset</button>
                <button className="action-btn copy" type="button" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>📋 Copy Hasil</button>
                <button className="action-btn share" type="button" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>🔗 Share</button>
                <button className="action-btn pdf" type="button" onClick={exportPDF}>📄 Export PDF</button>
                <SaveHistoryButton toolId="roi" toolName="ROI Calculator" inputs={{ modal, nilaiAkhir, biaya, durasi, inflasi }} result={{ totalModal, netProfit, simpleRoi, roiTahunan, realRoi, mode }} disabled={!show} />
              </div>
              <p className="calc-disclaimer">* ROI dihitung secara nominal sebelum inflasi. ROI riil = ROI nominal dikurangi tingkat inflasi yang dimasukkan. Hasil ini bukan merupakan jaminan atau saran investasi.</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ ROI Calculator" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="roi" /></div>
      <FooterSimple />
    </>
  );
}
