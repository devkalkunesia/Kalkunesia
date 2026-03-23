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
import { formatRupiah, formatNumber, parseNumber, copyResult, shareResult, exportPDF, validateInput, showToast } from '@/lib/utils';
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';
import SaveHistoryButton from '@/components/SaveHistoryButton';

const faqItems = [
  { question: 'Apa bedanya compound interest dengan bunga biasa?', answer: 'Bunga biasa (simple interest) hanya menghitung bunga dari modal awal. Compound interest menghitung bunga dari modal + akumulasi bunga sebelumnya, sehingga pertumbuhan jauh lebih cepat seiring waktu.' },
  { question: 'Investasi mana yang memberikan compound interest?', answer: 'Deposito, reksa dana, saham dividen yang di-reinvest, obligasi, dan tabungan berjangka. Reksa Dana adalah cara paling mudah untuk menikmati compound interest di Indonesia.' },
  { question: 'Berapa return realistis untuk investasi Indonesia?', answer: 'Deposito: 4-6%/tahun. Reksa Dana Pasar Uang: 5-7%/tahun. Reksa Dana Campuran: 8-12%/tahun. Reksa Dana Saham: 10-15%/tahun (jangka panjang).' },
  { question: 'Apakah ada pajak dari bunga investasi?', answer: 'Ya, bunga deposito dan beberapa instrumen lain dikenakan pajak final 20%. Reksa Dana tidak dikenakan pajak atas keuntungan selama masih dalam unit penyertaan.' },
];

const COMPOUND_DEFAULTS = {
  P: 10000000,
  PMT: 1000000,
  rate: 10,
  t: 10,
  frequency: 'monthly',
};

const frequencyOptions = [
  { value: 'daily', label: 'Harian (Daily)' },
  { value: 'monthly', label: 'Bulanan (Monthly)' },
  { value: 'yearly', label: 'Tahunan (Yearly)' },
];

const frequencyDescriptions: Record<string, string> = {
  daily: 'bunga dihitung harian',
  monthly: 'bunga dihitung bulanan',
  yearly: 'bunga dihitung tahunan',
};

export default function CompoundPage() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_compound_inputs', COMPOUND_DEFAULTS);
  const { P, PMT, rate, t, frequency } = inputs;
  const setField = (k: string, v: number | string) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [result, setResult] = useState<{
    rows: { yr: number; val: number; setor: number; bunga: number }[];
    finalVal: number;
    totalSetor: number;
    totalBunga: number;
  }>({ rows: [], finalVal: 0, totalSetor: 0, totalBunga: 0 });
  useScrollReveal(); useBackToTop();
  const resetForm = () => {
    setInputs(COMPOUND_DEFAULTS);
    setErrors({});
    setShow(false);
    setResult({ rows: [], finalVal: 0, totalSetor: 0, totalBunga: 0 });
  };
  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    const v1 = validateInput(t, { min: 1, max: 30, required: true, label: 'Durasi' });
    if (v1) e.t = v1;
    setErrors(e);
    if (Object.keys(e).length) {
      setShow(false);
      return;
    }
    const freqMap: Record<string, number> = { daily: 365, monthly: 12, yearly: 1 };
    const periodsPerYear = freqMap[frequency] ?? 12;
    const ratePerPeriod = rate / 100 / periodsPerYear;
    const totalPeriods = periodsPerYear * t;
    const periodicContribution = PMT * 12 / periodsPerYear;
    const yearLimit = Math.min(30, Math.max(1, Math.ceil(t)));
    const rows: { yr: number; val: number; setor: number; bunga: number }[] = [];
    for (let yr = 1; yr <= yearLimit; yr++) {
      const effectiveYear = Math.min(yr, t);
      const periods = periodsPerYear * effectiveYear;
      const val = ratePerPeriod === 0
        ? P + periodicContribution * periods
        : P * Math.pow(1 + ratePerPeriod, periods) + periodicContribution * (Math.pow(1 + ratePerPeriod, periods) - 1) / ratePerPeriod;
      const setor = P + PMT * 12 * effectiveYear;
      rows.push({ yr, val, setor, bunga: val - setor });
    }
    const finalVal = ratePerPeriod === 0
      ? P + periodicContribution * totalPeriods
      : P * Math.pow(1 + ratePerPeriod, totalPeriods) + periodicContribution * (Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod;
    const totalSetor = P + PMT * 12 * t;
    setResult({ rows, finalVal, totalSetor, totalBunga: finalVal - totalSetor });
    setShow(true);
  }, [P, PMT, rate, t, frequency]);

  useEffect(() => {
    const timer = setTimeout(hitung, 300);
    return () => clearTimeout(timer);
  }, [hitung]);

  const returnPct = result.totalSetor > 0 ? (result.totalBunga / result.totalSetor * 100).toFixed(1) : '0';
  const totalWithoutInterest = P + PMT * 12 * t;
  const interestGain = result.finalVal - totalWithoutInterest;
  const interestGainLabel = interestGain >= 0 ? `+${formatRupiah(interestGain)}` : formatRupiah(interestGain);

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Kalkulator Bunga Majemuk — Kalkunesia',
          description: 'Simulasi pertumbuhan investasi dengan bunga berbunga.',
          url: 'https://kalkunesia.com/tools/compound',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web Browser',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
          provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
        })}
      </script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Compound Interest" />
      <div className="tool-hero-wrapper">
        <ToolHero
          icon="💹"
          badge="📈"
          title="Compound Interest Calculator"
          subtitle="Simulasikan pertumbuhan investasi dengan bunga berbunga. Lihat bagaimana uang kamu tumbuh dari waktu ke waktu."
          tags={['✓ Bunga Berbunga', '✓ Setoran Rutin', '✓ Grafik Pertumbuhan', '✓ Gratis']}
        />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot compound interest illustration</title>
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
            <text x="45" y="75" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">📈</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448"/>
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448"/>
            <g className="robot-chart">
              <rect x="66" y="44" width="18" height="26" rx="3" fill="#fff" stroke="#0D9488" strokeWidth="1.5"/>
              <polyline points="70 64 74 56 80 60 86 48" stroke="#0D9488" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M86 48 L84 42 L90 44" stroke="#0D9488" strokeWidth="2" strokeLinecap="round"/>
            </g>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53"/>
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53"/>
          </svg>
        </div>
      </div>
      <ToolLayout sidebar={(
        <>
          {/* <AdSenseBox size="rectangle" /> */}
          <TipsCard
            title="💡 Tips Investasi Rutin"
            items={[
              { icon: '⏰', text: 'Mulai lebih awal — Investasi Rp 500rb/bulan mulai usia 25 vs 35 tahun bisa beda ratusan juta.' },
              { icon: '🔄', text: 'Konsistensi > Jumlah — Setoran kecil tapi rutin mengalahkan setoran besar tapi tidak konsisten.' },
              { icon: '📊', text: 'Reksa Dana Pasar Uang — Return 5-7%/tahun, risiko sangat rendah, cocok untuk pemula.' },
              { icon: '📈', text: 'Reksa Dana Saham — Potensi return 10-15%/tahun dalam jangka panjang (>5 tahun).' },
            ]}
          />
          <RelatedToolsCard
            items={[
              { icon: '📈', name: 'ROI Calculator', desc: 'Hitung return investasi', href: '/tools/roi' },
              { icon: '📊', name: 'Budget Planner', desc: 'Sisihkan untuk investasi', href: '/tools/budget' },
              { icon: '🏠', name: 'KPR Calculator', desc: 'Properti sebagai investasi', href: '/tools/kpr' },
            ]}
          />
          <KamusCard
            terms={[
              { term: 'Bunga Majemuk', def: 'Bunga yang dihitung dari pokok + bunga yang sudah terakumulasi.' },
              { term: 'Principal', def: 'Modal awal yang diinvestasikan sebelum ada pertumbuhan.' },
              { term: 'Compounding', def: 'Frekuensi penghitungan bunga, semakin sering semakin besar hasilnya.' },
              { term: 'CAGR', def: 'Compound Annual Growth Rate, rata-rata pertumbuhan per tahun.' },
              { term: 'Return', def: 'Keuntungan investasi dalam persentase terhadap modal awal.' },
              { term: 'DCA', def: 'Dollar Cost Averaging, strategi investasi rutin tanpa mempedulikan harga pasar.' },
            ]}
          />
          <BlogCard
            posts={[
              { title: 'Investasi Pertama? Mulai dari Ini', category: 'Investasi', readTime: '5 menit', slug: 'investasi-pertama-pemula' },
              { title: 'Reksa Dana vs Deposito: Mana Lebih Untung?', category: 'Investasi', readTime: '5 menit', slug: 'reksa-dana-vs-deposito' },
            ]}
          />
        </>
      )}>
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />Compound Interest Calculator</div>
          <div className="input-grid">
            <div className="input-group full">
              <label htmlFor="modalAwal" className="input-label">Modal Awal</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="modalAwal" type="text" inputMode="numeric" className="calc-input has-prefix" value={formatNumber(P)} onChange={e => setField('P', parseNumber(e.target.value))} />
              </div>
              <input className="slider" type="range" min={0} max={500000000} step={1000000} value={P} onChange={e => setField('P', parseNumber(e.target.value))} />
              <div className="slider-labels"><span>Rp 0</span><span>Rp 500jt</span></div>
            </div>
            <div className="input-group">
              <label htmlFor="setoranRutin" className="input-label">Setoran Rutin / Bulan</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="setoranRutin" type="text" inputMode="numeric" className="calc-input has-prefix" value={formatNumber(PMT)} onChange={e => setField('PMT', parseNumber(e.target.value))} />
              </div>
              <input className="slider" type="range" min={0} max={20000000} step={100000} value={PMT} onChange={e => setField('PMT', parseNumber(e.target.value))} />
              <div className="slider-labels"><span>Rp 0</span><span>Rp 20jt</span></div>
            </div>
            <div className="input-group">
              <label htmlFor="bungaTahunan" className="input-label">Bunga / Tahun</label>
              <div className="input-wrap">
                <input id="bungaTahunan" type="text" inputMode="numeric" className="calc-input" value={formatNumber(rate)} onChange={e => setField('rate', parseNumber(e.target.value))} step={0.1} />
                <span className="input-suffix">%</span>
              </div>
              <input className="slider" type="range" min={1} max={30} step={0.5} value={rate} onChange={e => setField('rate', parseNumber(e.target.value))} />
              <div className="slider-labels"><span>1%</span><span>30%</span></div>
            </div>
            <div className="input-group">
              <label htmlFor="durasiInvestasi" className="input-label">Durasi</label>
              <div className="input-wrap">
                <input
                  id="durasiInvestasi"
                  type="text"
                  inputMode="numeric"
                  className={`calc-input${errors.t ? ' input-error' : ''}`}
                  value={t}
                  onChange={e => {
                    setField('t', +e.target.value || 1);
                    setErrors(prev => ({ ...prev, t: '' }));
                  }}
                  min={1}
                  max={30}
                />
                <span className="input-suffix">Tahun</span>
              </div>
              <input className="slider" type="range" min={1} max={30} step={1} value={Math.min(30, Math.max(1, t))} onChange={e => setField('t', parseNumber(e.target.value))} />
              <div className="slider-labels"><span>1 thn</span><span>30 thn</span></div>
              {errors.t && <div className="error-msg">{errors.t}</div>}
            </div>
            <div className="input-group full">
              <label htmlFor="compoundFrequency" className="input-label">Frekuensi Compounding</label>
              <div className="select-wrapper">
                <select id="compoundFrequency" className="calc-select" value={frequency} onChange={e => setField('frequency', e.target.value)}>
                  {frequencyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="input-hint" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>{frequencyDescriptions[frequency] ?? 'bunga dihitung bulanan'}</div>
            </div>
          </div>
          {show && (
            <div>
              <div className="result-divider" />
              <div className="result-title-label">Hasil Simulasi Compound Interest</div>
              <div className="result-grid">
                <div className="result-card highlight">
                  <div className="result-label">Nilai Akhir</div>
                  <div className="result-value">{formatRupiah(result.finalVal)}</div>
                  <div className="result-sub">Total aset kamu</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Total Setor</div>
                  <div className="result-value">{formatRupiah(result.totalSetor)}</div>
                  <div className="result-sub">Modal + setoran rutin</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Total Bunga</div>
                  <div className="result-value">{formatRupiah(result.totalBunga)}</div>
                  <div className="result-sub">Uang tumbuh gratis</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Tanpa Bunga</div>
                  <div className="result-value">{formatRupiah(totalWithoutInterest)}</div>
                  <div className="result-sub">Modal + setoran rutin tanpa bunga</div>
                </div>
              </div>
              <div className="bracket-badge" style={{ color: interestGain >= 0 ? '#2DD4BF' : '#ef4444' }}>Keuntungan bunga: <strong>{interestGainLabel}</strong> dibanding tanpa bunga</div>
              <table className="result-table">
                <thead>
                  <tr>
                    <th>Tahun</th>
                    <th>Nilai</th>
                    <th>Total Setor</th>
                    <th>Bunga</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map(r => (
                    <tr key={r.yr}>
                      <td>{r.yr}</td>
                      <td>{formatRupiah(r.val)}</td>
                      <td>{formatRupiah(r.setor)}</td>
                      <td>{formatRupiah(r.bunga)}</td>
                    </tr>
                  ))}
                  <tr><td colSpan={3} style={{ borderTop: '1px solid var(--border)' }}>Tanpa Bunga</td><td className="right" style={{ borderTop: '1px solid var(--border)' }}>{formatRupiah(totalWithoutInterest)}</td></tr>
                  <tr><td colSpan={3}>Keuntungan Bunga</td><td className="right">{interestGain >= 0 ? '+' : '-'}{formatRupiah(Math.abs(interestGain))}</td></tr>
                </tbody>
              </table>
              <div className="bracket-badge" style={{ marginTop: 12 }}>Frekuensi compounding: <strong>{frequencyOptions.find(opt => opt.value === frequency)?.label ?? frequency}</strong></div>
              <div className="action-bar">
                <button type="button" className="action-btn reset" onClick={resetForm}>🔄 Reset</button>
                <button
                  type="button"
                  className="action-btn copy"
                  onClick={() => {
                    copyResult();
                    showToast('✅ Hasil disalin!');
                  }}
                >
                  📋 Copy Hasil
                </button>
                <button
                  type="button"
                  className="action-btn share"
                  onClick={() => {
                    shareResult();
                    showToast('🔗 Link berhasil dibagikan!');
                  }}
                >
                  🔗 Share
                </button>
                <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
                <SaveHistoryButton
                  toolId="compound"
                  toolName="Compound Interest"
                  inputs={{ P, PMT, rate, t, frequency }}
                  result={{ finalVal: result.finalVal, totalSetor: result.totalSetor, totalBunga: result.totalBunga }}
                  disabled={!show}
                />
              </div>
              <p className="calc-disclaimer">* Hasil simulasi bersifat estimasi. Return aktual dapat berbeda tergantung kondisi pasar, inflasi, dan jenis instrumen investasi. Bukan merupakan saran investasi.</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Compound Interest Calculator" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="compound" /></div>
      <FooterSimple />
    </>
  );
}
