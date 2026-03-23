'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import ToolHero from '@/components/ToolHero';
import ToolLayout from '@/components/ToolLayout';
import AdSenseBox from '@/components/AdSenseBox';
import FaqSection from '@/components/FaqSection';
import MoreTools from '@/components/MoreTools';
import { TipsCard, RelatedToolsCard, BlogCard, KamusCard } from '@/components/SidebarCards';
import { FooterSimple } from '@/components/Footer';
import { formatRupiah, formatNumber, parseNumber, showToast, validateInput } from '@/lib/utils'
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';
import SaveHistoryButton from '@/components/SaveHistoryButton';
import './kpr.css';

const Chart = dynamic(() => import('react-chartjs-2').then(m => m.Chart), { ssr: false });

interface AmortRow { bulan: number; cicilan: number; pokok: number; bunga: number; sisa: number; }

function calcAnuitas(pokok: number, rBulan: number, nBulan: number) {
  if (rBulan === 0) return pokok / nBulan;
  return pokok * (rBulan * Math.pow(1 + rBulan, nBulan)) / (Math.pow(1 + rBulan, nBulan) - 1);
}

const faqItems = [
  { question: 'Apa itu KPR dan bagaimana cara kerjanya?', answer: 'KPR (Kredit Pemilikan Rumah) adalah fasilitas kredit dari bank untuk pembelian properti. Anda membayar cicilan bulanan yang mencakup pokok pinjaman dan bunga selama tenor yang disepakati.' },
  { question: 'Berapa DP minimal untuk KPR?', answer: 'DP minimal KPR bervariasi mulai dari 0% hingga 20% tergantung kebijakan bank dan jenis properti. Untuk rumah pertama, beberapa bank menawarkan DP 0-10%.' },
  { question: 'Apa perbedaan bunga fixed dan floating?', answer: 'Bunga fixed tetap sama selama periode tertentu (biasanya 1-5 tahun), sedangkan bunga floating bisa berubah mengikuti suku bunga pasar (BI Rate).' },
  { question: 'Bagaimana cara menurunkan cicilan KPR?', answer: 'Anda bisa: 1) Memperbesar DP, 2) Memilih tenor lebih panjang, 3) Negosiasi suku bunga lebih rendah, 4) Melakukan pelunasan sebagian (extra payment).' },
  { question: 'Apa itu rasio DTI dan kenapa penting?', answer: 'DTI (Debt-to-Income) adalah persentase cicilan terhadap penghasilan. Bank umumnya mensyaratkan DTI maksimal 30-40% untuk persetujuan KPR.' },
];

const kamusTerms = [
  { term: 'KPR', def: 'Kredit Pemilikan Rumah, fasilitas kredit bank untuk membeli properti.' },
  { term: 'Anuitas', def: 'Cicilan tetap setiap bulan yang mencakup pokok dan bunga.' },
  { term: 'DP', def: 'Down Payment, uang muka yang dibayar di awal pembelian properti.' },
  { term: 'Tenor', def: 'Jangka waktu pinjaman KPR, biasanya 5-30 tahun.' },
  { term: 'Bunga Fixed', def: 'Suku bunga tetap selama periode tertentu (biasanya 1-5 tahun).' },
  { term: 'DTI', def: 'Debt-to-Income, rasio cicilan terhadap penghasilan, idealnya di bawah 30%.' },
];

export default function KPRPage() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_kpr_inputs', {
    harga: 500000000, dp: 20, dpMode: 'persen' as 'persen' | 'rupiah',
    bunga: 7.5, tenor: 20, rateMode: 'fixed' as 'fixed' | 'mixed',
    bungaFloat: 9, periodeFixed: 3, showBiaya: false,
    provisi: 1, notaris: 5000000, asuransiJiwa: 0.5, asuransiKebakaran: 0.1,
    extraPay: 0, gaji: 0,
  });
  const { harga, dp, dpMode, bunga, tenor, rateMode, bungaFloat, periodeFixed, showBiaya, provisi, notaris, asuransiJiwa, asuransiKebakaran, extraPay, gaji } = inputs;
  const setField = (k: string, v: number | string | boolean) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [resCicilan, setResCicilan] = useState(0);
  const [resTotal, setResTotal] = useState(0);
  const [resBunga, setResBunga] = useState(0);
  const [resTenor, setResTenor] = useState(0);
  const [biayaTotal, setBiayaTotal] = useState(0);
  const [dtiRatio, setDtiRatio] = useState(0);
  const [ppInfo, setPpInfo] = useState('');
  const [amortData, setAmortData] = useState<AmortRow[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showAmort, setShowAmort] = useState(false);
  const [amortLimit, setAmortLimit] = useState(60);
  const [chartTab, setChartTab] = useState<'donut' | 'line'>('donut');
  const [chartData, setChartData] = useState<{ pokok: number; bunga: number }>({ pokok: 0, bunga: 0 });
  const [lineData, setLineData] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [showTenorCompare, setShowTenorCompare] = useState(false);
  const [tenorCompareData, setTenorCompareData] = useState<{ tenor: number; cicilan: number; bunga: number; total: number }[]>([]);
  const [chartReady, setChartReady] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);
  useScrollReveal();
  useBackToTop();

  useEffect(() => {
    import('chart.js').then(mod => {
      mod.Chart.register(
        mod.ArcElement, mod.Tooltip, mod.Legend,
        mod.LineElement, mod.PointElement, mod.CategoryScale,
        mod.LinearScale, mod.Filler
      );
      setChartReady(true);
    });
  }, []);

  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    const v1 = validateInput(harga, { min: 100000000, max: 50000000000, required: true, label: 'Harga properti' });
    if (v1) e.harga = v1;
    if (dpMode === 'persen') {
      const v2 = validateInput(dp, { min: 0, max: 90, label: 'Down payment' });
      if (v2) e.dp = v2;
    }
    const v3 = validateInput(tenor, { min: 1, max: 35, required: true, label: 'Tenor' });
    if (v3) e.tenor = v3;
    const v4 = validateInput(bunga, { min: 0.1, max: 30, required: true, label: 'Suku bunga' });
    if (v4) e.bunga = v4;
    setErrors(e);
    if (Object.keys(e).length) { setShowResult(false); return; }

    const h = harga || 0;
    const dpFrac = dpMode === 'persen' ? (dp || 0) / 100 : (dp || 0) / h;
    const bFixedPct = (bunga || 0) / 100;
    const ten = tenor || 1;
    const pokok = h * (1 - dpFrac);
    const n = ten * 12;
    const rFixed = bFixedPct / 12;

    let bFloat = bFixedPct, pfBulan = n;
    if (rateMode === 'mixed') {
      bFloat = (bungaFloat || bFixedPct * 100) / 100;
      pfBulan = (periodeFixed || 3) * 12;
    }
    const rFloat = bFloat / 12;

    const amort: AmortRow[] = [];
    let sisa = pokok, totalBayar = 0, totalBungaSum = 0;
    const cicilanFixed = calcAnuitas(pokok, rFixed, n);
    let cicilanCur = cicilanFixed;

    for (let i = 1; i <= n; i++) {
      const r = (i <= pfBulan) ? rFixed : rFloat;
      if (i === pfBulan + 1 && rateMode === 'mixed') cicilanCur = calcAnuitas(sisa, rFloat, n - pfBulan);
      const bBulan = sisa * r;
      const pBulan = cicilanCur - bBulan;
      sisa = Math.max(0, sisa - pBulan);
      totalBayar += cicilanCur;
      totalBungaSum += bBulan;
      amort.push({ bulan: i, cicilan: cicilanCur, pokok: pBulan, bunga: bBulan, sisa });
      if (sisa <= 0) break;
    }

    setResCicilan(cicilanFixed);
    setResTotal(totalBayar);
    setResBunga(totalBungaSum);
    setResTenor(amort.length);
    setAmortData(amort);
    setChartData({ pokok, bunga: totalBungaSum });

    const yearly: { year: number; sisa: number }[] = [];
    for (let i = 0; i < amort.length; i += 12) {
      yearly.push({ year: Math.floor(i / 12) + 1, sisa: amort[Math.min(i + 11, amort.length - 1)].sisa });
    }
    setLineData({ labels: yearly.map(d => 'Thn ' + d.year), data: yearly.map(d => d.sisa) });

    // Biaya tambahan
    if (showBiaya) {
      const bProv = (provisi || 0) / 100 * pokok;
      const bNot = notaris || 0;
      const bAJ = (asuransiJiwa || 0) / 100 * pokok * ten;
      const bAK = (asuransiKebakaran || 0) / 100 * h * ten;
      setBiayaTotal(bProv + bNot + bAJ + bAK);
    } else { setBiayaTotal(0); }

    // DTI
    if (gaji > 0) setDtiRatio(+(cicilanFixed / gaji * 100).toFixed(1));
    else setDtiRatio(0);

    // Extra payment
    if (extraPay > 0) {
      let sisaEP = pokok, bulanEP = 0, tBungaEP = 0;
      const cEP = cicilanFixed + extraPay;
      while (sisaEP > 0 && bulanEP < n) {
        bulanEP++;
        const r = (bulanEP <= pfBulan) ? rFixed : rFloat;
        const bb = sisaEP * r;
        tBungaEP += bb;
        sisaEP -= (cEP - bb);
      }
      const hematBulan = n - bulanEP;
      const hT = Math.floor(hematBulan / 12);
      const hS = hematBulan % 12;
      const hematBunga = totalBungaSum - tBungaEP;
      setPpInfo(`Dengan extra ${formatRupiah(extraPay)}/bulan, tenor jadi ${bulanEP} bulan (hemat ${hT} tahun ${hS} bulan). Hemat bunga: ${formatRupiah(Math.max(0, hematBunga))}`);
    } else { setPpInfo(''); }

    setShowResult(true);

    // URL params
    const params = new URLSearchParams();
    params.set('harga', '' + h); params.set('dp', '' + dp);
    params.set('dpMode', dpMode); params.set('bunga', '' + bunga);
    params.set('tenor', '' + ten); params.set('mode', rateMode);
    if (rateMode === 'mixed') { params.set('bungaFloat', '' + bungaFloat); params.set('periodeFixed', '' + periodeFixed); }
    if (extraPay) params.set('extra', '' + extraPay);
    if (gaji) params.set('gaji', '' + gaji);
    history.replaceState(null, '', '?' + params.toString());
  }, [harga, dp, dpMode, bunga, tenor, rateMode, bungaFloat, periodeFixed, showBiaya, provisi, notaris, asuransiJiwa, asuransiKebakaran, extraPay, gaji]);

  // Auto-calc with debounce
  useEffect(() => {
    const t = setTimeout(hitung, 300);
    return () => clearTimeout(t);
  }, [hitung]);

  // Load from URL params on mount (overrides localStorage)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (!p.has('harga')) return;
    setInputs(prev => {
      const next = { ...prev };
      if (p.has('harga')) next.harga = +p.get('harga')!;
      if (p.has('dp')) next.dp = +p.get('dp')!;
      if (p.get('dpMode') === 'rupiah') next.dpMode = 'rupiah';
      if (p.has('bunga')) next.bunga = +p.get('bunga')!;
      if (p.has('tenor')) next.tenor = +p.get('tenor')!;
      if (p.get('mode') === 'mixed') { next.rateMode = 'mixed'; if (p.has('bungaFloat')) next.bungaFloat = +p.get('bungaFloat')!; if (p.has('periodeFixed')) next.periodeFixed = +p.get('periodeFixed')!; }
      if (p.has('extra')) next.extraPay = +p.get('extra')!;
      if (p.has('gaji')) next.gaji = +p.get('gaji')!;
      return next;
    });
  }, [setInputs]);

  const toggleTenorCompare = () => {
    const showing = !showTenorCompare;
    setShowTenorCompare(showing);
    if (!showing) return;
    const h = harga || 0;
    const dpFrac = dpMode === 'persen' ? (dp || 0) / 100 : (dp || 0) / h;
    const pk = h * (1 - dpFrac);
    const r = ((bunga || 0) / 100) / 12;
    const data = [5, 10, 15, 20, 25, 30].map(t => {
      const nB = t * 12, c = calcAnuitas(pk, r, nB), tb = c * nB;
      return { tenor: t, cicilan: c, bunga: tb - pk, total: tb };
    });
    setTenorCompareData(data);
  };

  const downloadCSV = () => {
    let csv = 'Bulan,Cicilan,Pokok,Bunga,Sisa\n';
    amortData.forEach(d => { csv += `${d.bulan},${Math.round(d.cicilan)},${Math.round(d.pokok)},${Math.round(d.bunga)},${Math.round(d.sisa)}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'amortisasi-kpr.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('⬇ CSV berhasil didownload');
  };

  const copyRingkasan = () => {
    const text = `Simulasi KPR Kalkunesia\nCicilan/bulan: ${formatRupiah(resCicilan)}\nTotal Bayar: ${formatRupiah(resTotal)}\nTotal Bunga: ${formatRupiah(resBunga)}\nTenor: ${resTenor} bulan\n\n${window.location.href}`;
    navigator.clipboard.writeText(text).then(() => showToast('📋 Ringkasan disalin!'));
  };

  const shareURL = () => { navigator.clipboard.writeText(window.location.href).then(() => showToast('🔗 Link disalin!')); };
  const exportPDF = () => { window.print(); };
  const bungaPct = resTotal > 0 ? (resBunga / resTotal * 100).toFixed(1) : '0';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Kalkulator KPR — Kalkunesia',
            description: 'Simulasi cicilan KPR, tabel amortisasi, dan total bunga.',
            url: 'https://kalkunesia.com/tools/kpr',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web Browser',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
            provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
          }),
        }}
      />
      <Navbar variant="simple" />
      <Breadcrumb toolName="KPR Calculator" />
      <div className="tool-hero-wrapper">
        <ToolHero icon="🏠" badge="KREDIT PROPERTI" title="KPR Calculator" subtitle="Simulasi cicilan KPR lengkap — hitung cicilan, total bunga, tabel amortisasi, dan bandingkan skenario tenor." tags={['Anuitas', 'Fixed & Floating', 'Amortisasi', 'PDF Export', 'Share URL']} />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle className="robot-antenna" cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8" />
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53" />
            <circle className="robot-eye" cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="35" cy="33" r="2.5" fill="#fff" />
            <circle className="robot-eye" cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="55" cy="33" r="2.5" fill="#fff" />
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6" />
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448" />
            <rect className="robot-badge" x="34" y="62" width="24" height="20" rx="6" fill="#0D9488" opacity="0.85" />
            <text x="46" y="76" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">🏠</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="70" y="70" width="4" height="18" rx="2" fill="#0D9488" />
            <circle cx="69" cy="90" r="4" fill="#0D9488" />
            <circle cx="69" cy="90" r="2" fill="#fff" opacity="0.9" />
            <rect x="72" y="44" width="18" height="22" rx="3" fill="none" stroke="#0D9488" strokeWidth="1.5" />
            <line x1="75" y1="51" x2="87" y2="51" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="75" y1="55" x2="87" y2="55" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="75" y1="59" x2="83" y2="59" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>

      <ToolLayout sidebar={
        <>
          {/* <AdSenseBox size="rectangle" /> */}
          <TipsCard title="💡 Tips KPR" items={[
            { icon: '✅', text: 'Rasio cicilan ideal: maksimal 30% dari gaji bulanan' },
            { icon: '📊', text: 'Bandingkan 3-5 bank untuk dapat suku bunga terbaik' },
            { icon: '💰', text: 'DP lebih besar = cicilan lebih ringan & bunga lebih kecil' },
            { icon: '🏦', text: 'Perhatikan bunga floating setelah masa fixed berakhir' },
          ]} />
          <RelatedToolsCard items={[
            { icon: '📋', name: 'PPh 21 Calculator', desc: 'Pajak penghasilan 2025', href: '/tools/pph-21' },
            { icon: '🛡️', name: 'BPJS Calculator', desc: 'Iuran BPJS 2025', href: '/tools/bpjs' },
            { icon: '📊', name: 'Budget Planner', desc: 'Anggaran 50/30/20', href: '/tools/budget' },
          ]} />
          <KamusCard terms={kamusTerms} />
          <BlogCard posts={[{ title: 'Beli Rumah Pertama: Checklist Lengkap', category: 'Properti', readTime: '7 menit', slug: 'checklist-beli-rumah-pertama' },{ title: 'KPR Subsidi vs Non-Subsidi: Pilih Mana?', category: 'Properti', readTime: '5 menit', slug: 'kpr-subsidi-vs-non-subsidi' }]} />
        </>
      }>
        {/* CALCULATOR CARD */}
        <div className="calc-card">
          {/* Harga */}
          <div className="input-group"><label className="input-label">Harga Properti</label><div className="input-wrap"><span className="input-prefix">Rp</span><input type="text" inputMode="numeric" className={`calc-input${errors.harga ? ' input-error' : ''}`} value={formatNumber(harga)} onChange={e => { setField('harga', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, harga: '' })); }} /></div>
            <input type="range" className="slider" min={100000000} max={5000000000} step={10000000} value={harga} onChange={e => setField('harga', parseNumber(e.target.value))} />
            <div className="slider-labels"><span>Rp 100jt</span><span>Rp 5M</span></div>
            {errors.harga && <div className="error-msg">{errors.harga}</div>}
          </div>

          {/* DP */}
          <div className="input-group">
            <div className="label-row"><label className="input-label">Down Payment</label><div className="mode-toggle"><button className={`mode-btn${dpMode === 'persen' ? ' active' : ''}`} onClick={() => setField('dpMode', 'persen')}>%</button><button className={`mode-btn${dpMode === 'rupiah' ? ' active' : ''}`} onClick={() => setField('dpMode', 'rupiah')}>Rp</button></div></div>
            {dpMode === 'persen' ? (
              <><div className="input-wrap"><input type="text" inputMode="numeric" className={`calc-input${errors.dp ? ' input-error' : ''}`} value={dp} onChange={e => { setField('dp', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, dp: '' })); }} min={0} max={90} /><span className="input-suffix">%</span></div>
                <input type="range" className="slider" min={0} max={90} step={5} value={dp} onChange={e => setField('dp', parseNumber(e.target.value))} /><div className="slider-labels"><span>0%</span><span>90%</span></div>{errors.dp && <div className="error-msg">{errors.dp}</div>}</>
            ) : (
              <><div className="input-wrap"><span className="input-prefix">Rp</span><input type="text" inputMode="numeric" className="calc-input" value={formatNumber(dp)} onChange={e => setField('dp', parseNumber(e.target.value))} /></div>
                <input type="range" className="slider" min={0} max={harga} step={5000000} value={dp} onChange={e => setField('dp', parseNumber(e.target.value))} /><div className="slider-labels"><span>Rp 0</span><span>{formatRupiah(harga)}</span></div></>
            )}
          </div>

          {/* Rate Mode */}
          <div className="input-group">
            <div className="label-row"><label className="input-label">Suku Bunga</label><div className="mode-toggle"><button className={`mode-btn${rateMode === 'fixed' ? ' active' : ''}`} onClick={() => setField('rateMode', 'fixed')}>Fixed</button><button className={`mode-btn${rateMode === 'mixed' ? ' active' : ''}`} onClick={() => setField('rateMode', 'mixed')}>Mixed</button></div></div>
            <div className="input-wrap"><input type="text" inputMode="numeric" className={`calc-input${errors.bunga ? ' input-error' : ''}`} value={bunga} onChange={e => { setField('bunga', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, bunga: '' })); }} min={0} max={30} step={0.1} /><span className="input-suffix">%/thn</span></div>
            <input type="range" className="slider" min={0} max={20} step={0.1} value={bunga} onChange={e => setField('bunga', parseNumber(e.target.value))} /><div className="slider-labels"><span>0%</span><span>20%</span></div>
            {errors.bunga && <div className="error-msg">{errors.bunga}</div>}
          </div>

          {rateMode === 'mixed' && (
            <div className="floating-fields show">
              <div className="input-group"><label className="input-label">Bunga Floating</label><div className="input-wrap"><input type="text" inputMode="numeric" className="calc-input" value={formatNumber(bungaFloat)} onChange={e => setField('bungaFloat', parseNumber(e.target.value))} step={0.1} /><span className="input-suffix">%/thn</span></div></div>
              <div className="input-group"><label className="input-label">Periode Fixed</label><div className="input-wrap"><input type="text" inputMode="numeric" className="calc-input" value={formatNumber(periodeFixed)} onChange={e => setField('periodeFixed', parseNumber(e.target.value))} /><span className="input-suffix">tahun</span></div></div>
            </div>
          )}

          {/* Tenor */}
          <div className="input-group"><label className="input-label">Tenor</label><div className="input-wrap"><input type="text" inputMode="numeric" className={`calc-input${errors.tenor ? ' input-error' : ''}`} value={tenor} onChange={e => { setField('tenor', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, tenor: '' })); }} min={1} max={30} /><span className="input-suffix">tahun</span></div>
            <input type="range" className="slider" min={1} max={30} step={1} value={tenor} onChange={e => setField('tenor', parseNumber(e.target.value))} /><div className="slider-labels"><span>1 thn</span><span>30 thn</span></div>
            {errors.tenor && <div className="error-msg">{errors.tenor}</div>}
          </div>

          {/* Biaya Tambahan */}
          <div className="biaya-toggle" onClick={() => setField('showBiaya', !showBiaya)}>
            <span>💰 Biaya Tambahan (opsional)</span><span className={`biaya-chevron${showBiaya ? ' open' : ''}`}>▾</span>
          </div>
          {showBiaya && (
            <div className="biaya-fields open">
              <div className="input-group"><label className="input-label">Provisi (%)</label><div className="input-wrap"><input type="text" inputMode="numeric" className="calc-input" value={formatNumber(provisi)} onChange={e => setField('provisi', parseNumber(e.target.value))} step={0.1} /><span className="input-suffix">%</span></div></div>
              <div className="input-group"><label className="input-label">Biaya Notaris</label><div className="input-wrap"><span className="input-prefix">Rp</span><input type="text" inputMode="numeric" className="calc-input" value={formatNumber(notaris)} onChange={e => setField('notaris', parseNumber(e.target.value))} /></div></div>
              <div className="input-group"><label className="input-label">Asuransi Jiwa (%/thn)</label><div className="input-wrap"><input type="text" inputMode="numeric" className="calc-input" value={formatNumber(asuransiJiwa)} onChange={e => setField('asuransiJiwa', parseNumber(e.target.value))} step={0.01} /><span className="input-suffix">%</span></div></div>
              <div className="input-group"><label className="input-label">Asuransi Kebakaran (%/thn)</label><div className="input-wrap"><input type="text" inputMode="numeric" className="calc-input" value={formatNumber(asuransiKebakaran)} onChange={e => setField('asuransiKebakaran', parseNumber(e.target.value))} step={0.01} /><span className="input-suffix">%</span></div></div>
            </div>
          )}

          {/* Extra Payment & Gaji */}
          <div className="input-group"><label className="input-label">Extra Payment /bulan (opsional)</label><div className="input-wrap"><span className="input-prefix">Rp</span><input type="text" inputMode="numeric" className="calc-input" value={formatNumber(extraPay)} onChange={e => setField('extraPay', parseNumber(e.target.value))} placeholder="0" /></div></div>
          <div className="input-group"><label className="input-label">Gaji Bulanan (untuk DTI)</label><div className="input-wrap"><span className="input-prefix">Rp</span><input type="text" inputMode="numeric" className="calc-input" value={formatNumber(gaji)} onChange={e => setField('gaji', parseNumber(e.target.value))} placeholder="0" /></div></div>

          {/* RESULTS */}
          {showResult && (
            <div className="result-section show" ref={resultRef}>
              <div className="result-grid" id="resultGrid">
                <div className="result-card"><div className="result-label">Cicilan / Bulan</div><div className="result-value">{formatRupiah(resCicilan)}</div><div className="result-sub">Anuitas tetap selama tenor</div></div>
                <div className="result-card"><div className="result-label">Total Bayar</div><div className="result-value">{formatRupiah(resTotal)}</div><div className="result-sub">Selama {resTenor} bulan</div></div>
                <div className="result-card"><div className="result-label">Total Bunga</div><div className="result-value">{formatRupiah(resBunga)}</div><div className="result-sub">{((resBunga / resTotal) * 100).toFixed(1)}% dari total bayar</div></div>
                {biayaTotal > 0 && <div className="result-card biaya-card"><div className="result-label">Biaya Tambahan</div><div className="result-value">{formatRupiah(biayaTotal)}</div><div className="result-sub">Provisi+notaris+asuransi</div></div>}
              </div>
              <div className="bracket-badge">Total Bunga: <strong>{bungaPct}%</strong> dari total pembayaran</div>

              {dtiRatio > 0 && (
                <div className={`dti-badge show ${dtiRatio <= 30 ? 'green' : dtiRatio <= 40 ? 'yellow' : 'red'}`}>
                  {dtiRatio <= 30 ? `✅ Cicilan ${dtiRatio}% dari gaji — Layak diajukan` : dtiRatio <= 40 ? `⚠️ Cicilan ${dtiRatio}% dari gaji — Batas wajar` : `❌ Cicilan ${dtiRatio}% dari gaji — Terlalu berat`}
                </div>
              )}
              {ppInfo && <div className="prepay-badge show">🚀 Pelunasan Dipercepat<br />{ppInfo}</div>}

              {/* Charts */}
              {chartReady && (
                <div className="chart-section show">
                  <div className="chart-tabs"><button className={`chart-tab${chartTab === 'donut' ? ' active' : ''}`} onClick={() => setChartTab('donut')}>🍩 Proporsi</button><button className={`chart-tab${chartTab === 'line' ? ' active' : ''}`} onClick={() => setChartTab('line')}>📈 Sisa Hutang</button></div>
                  <div style={{ display: chartTab === 'donut' ? 'block' : 'none', height: 260 }}>
                    <Chart type="doughnut" data={{ labels: ['Pokok Pinjaman', 'Total Bunga'], datasets: [{ data: [chartData.pokok, chartData.bunga], backgroundColor: ['#0D9488', '#1B3C53'], borderWidth: 0, borderRadius: 6 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 11, weight: 'bold' } } } } }} />
                  </div>
                  <div style={{ display: chartTab === 'line' ? 'block' : 'none', height: 260 }}>
                    <Chart type="line" data={{ labels: lineData.labels, datasets: [{ label: 'Sisa Hutang', data: lineData.data, borderColor: '#0D9488', backgroundColor: 'rgba(13,148,136,.1)', fill: true, tension: .4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#0D9488' }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: (v: number | string) => 'Rp ' + (Number(v) / 1e6).toFixed(0) + 'jt', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,.05)' } }, x: { ticks: { font: { size: 9 } }, grid: { display: false } } } } as never} />
                  </div>
                </div>
              )}

              {/* Tenor Compare */}
              <button className="compare-btn" onClick={toggleTenorCompare}>📊 {showTenorCompare ? 'Sembunyikan' : 'Bandingkan'} Tenor</button>
              {showTenorCompare && (
                <div className="tenor-compare show">
                  <div className="table-wrap"><table><thead><tr><th>Tenor</th><th>Cicilan/bln</th><th>Total Bunga</th><th>Total Bayar</th></tr></thead><tbody>
                    {tenorCompareData.map(d => (<tr key={d.tenor} className={d.tenor === tenor ? 'active' : ''}><td>{d.tenor} Tahun</td><td>{formatRupiah(d.cicilan)}</td><td>{formatRupiah(d.bunga)}</td><td>{formatRupiah(d.total)}</td></tr>))}
                  </tbody></table></div>
                </div>
              )}

              {/* Amortization */}
              <div className="amort-section">
                <button className="amort-toggle" onClick={() => setShowAmort(!showAmort)}><span>📊 {showAmort ? 'Sembunyikan' : 'Lihat'} Tabel Amortisasi</span><span className={`amort-arrow${showAmort ? ' open' : ''}`}>▾</span></button>
                {showAmort && (
                  <div className="amort-wrap open">
                    <div className="table-wrap"><table><thead><tr><th>Bulan</th><th>Cicilan</th><th>Pokok</th><th>Bunga</th><th>Sisa Hutang</th></tr></thead><tbody>
                      {amortData.slice(0, amortLimit).map(d => (<tr key={d.bulan}><td>{d.bulan}</td><td>{formatRupiah(d.cicilan)}</td><td>{formatRupiah(d.pokok)}</td><td>{formatRupiah(d.bunga)}</td><td>{formatRupiah(d.sisa)}</td></tr>))}
                      {amortLimit < amortData.length && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 12 }}>... {amortData.length - amortLimit} bulan lainnya</td></tr>}
                    </tbody></table></div>
                    <div className="amort-actions">
                      {amortLimit < amortData.length && <button className="action-btn copy" onClick={() => { setAmortLimit(99999); showToast('Tabel lengkap ditampilkan'); }}>📊 Tampilkan Semua</button>}
                      <button className="action-btn copy" onClick={downloadCSV}>⬇ Download CSV</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="action-bar">
                <button className="action-btn copy" onClick={copyRingkasan}>📋 Copy</button>
                <button className="action-btn share" onClick={shareURL}>🔗 Share URL</button>
                <button className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
                <SaveHistoryButton
                  toolId="kpr"
                  toolName="KPR Calculator"
                  inputs={{ harga, dp, dpMode, bunga, tenor, rateMode }}
                  result={{ cicilan: resCicilan, totalBunga: resBunga, totalBayar: resTotal }}
                  disabled={!showResult}
                />
              </div>
              <p className="calc-disclaimer">* Simulasi menggunakan metode anuitas. Cicilan aktual dapat berbeda tergantung kebijakan bank, biaya provisi, dan asuransi. Konsultasikan dengan bank sebelum mengajukan KPR.</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ — KPR Calculator" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="kpr" /></div>
      <FooterSimple />

      {/* Mobile Sticky Bar */}
      {showResult && (
        <div className="sticky-bar show">
          <div><div className="sticky-label">Cicilan/bulan</div><div className="sticky-value">{formatRupiah(resCicilan)}</div></div>
          <button className="sticky-btn" onClick={() => resultRef.current?.scrollIntoView({ behavior: 'smooth' })}>Lihat Detail ↓</button>
        </div>
      )}
    </>
  );
}
