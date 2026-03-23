'use client';
import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import ToolHero from '@/components/ToolHero';
import ToolLayout from '@/components/ToolLayout';
import AdSenseBox from '@/components/AdSenseBox';
import FaqSection from '@/components/FaqSection';
import MoreTools from '@/components/MoreTools';
import { TipsCard, RelatedToolsCard, BlogCard, KamusCard } from '@/components/SidebarCards';
import { FooterSimple } from '@/components/Footer';
import { formatRupiah, formatNumber, parseNumber, copyResult, shareResult, exportPDF, validateInput } from '@/lib/utils';
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';
import SaveHistoryButton from '@/components/SaveHistoryButton';

const ptkpOptions = [
  { label: 'TK/0 — Belum kawin, tanpa tanggungan', value: 54000000 },
  { label: 'K/0 — Kawin, tanpa tanggungan', value: 58500000 },
  { label: 'K/1 — Kawin, 1 tanggungan', value: 63000000 },
  { label: 'K/2 — Kawin, 2 tanggungan', value: 67500000 },
  { label: 'K/3 — Kawin, 3 tanggungan', value: 72000000 },
];

const defaultPPh21Inputs = {
  gajiPokok: 8000000,
  tunjanganJabatan: 500000,
  tunjanganTransport: 750000,
  tunjanganLain: 1250000,
  bonus: 0,
  ptkp: 54000000,
  pensiun: 200000,
  status: 'tetap',
};

const schemaData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Kalkulator PPh 21 — Kalkunesia',
  description: 'Hitung pajak penghasilan karyawan sesuai tarif progresif 2025 dengan tunjangan lengkap.',
  url: 'https://kalkunesia.com/tools/pph-21',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
  provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
});

const faqItems = [
  { question: 'Siapa yang wajib bayar PPh 21?', answer: 'Setiap karyawan, pekerja lepas, atau penerima penghasilan tetap yang penghasilannya melebihi PTKP wajib membayar PPh 21.' },
  { question: 'Apa itu PTKP?', answer: 'PTKP (Penghasilan Tidak Kena Pajak) adalah batas penghasilan yang tidak dikenakan pajak. Besarannya berbeda tergantung status pernikahan dan jumlah tanggungan.' },
  { question: 'Bagaimana cara menghitung PPh 21?', answer: 'PPh 21 dihitung dari PKP (Penghasilan Kena Pajak) = Bruto – Biaya Jabatan – Iuran Pensiun – PTKP. PKP kemudian dikenakan tarif progresif.' },
  { question: 'Berapa tarif PPh 21 terbaru 2025?', answer: '5% (s/d 60jt), 15% (60jt-250jt), 25% (250jt-500jt), 30% (500jt-5M), 35% (di atas 5M).' },
];

const terKatA = [{ max: 5400000, rate: 0 }, { max: 5650000, rate: 0.0025 }, { max: 5950000, rate: 0.005 }, { max: 6300000, rate: 0.0075 }, { max: 6750000, rate: 0.01 }, { max: 7500000, rate: 0.0125 }, { max: 8550000, rate: 0.015 }, { max: 9650000, rate: 0.0175 }, { max: 10050000, rate: 0.02 }, { max: 10350000, rate: 0.0225 }, { max: 10700000, rate: 0.025 }, { max: 11050000, rate: 0.03 }, { max: 11600000, rate: 0.035 }, { max: 12500000, rate: 0.04 }, { max: 13750000, rate: 0.05 }, { max: 15100000, rate: 0.06 }, { max: 16950000, rate: 0.07 }, { max: 19750000, rate: 0.08 }, { max: 24150000, rate: 0.09 }, { max: 26450000, rate: 0.1 }, { max: 28000000, rate: 0.11 }, { max: 30050000, rate: 0.12 }, { max: 32400000, rate: 0.13 }, { max: 35400000, rate: 0.14 }, { max: 39100000, rate: 0.15 }, { max: 43850000, rate: 0.16 }, { max: 47800000, rate: 0.17 }, { max: 51400000, rate: 0.18 }, { max: 56300000, rate: 0.19 }, { max: 62200000, rate: 0.2 }, { max: 74900000, rate: 0.21 }, { max: 95300000, rate: 0.22 }, { max: 110000000, rate: 0.23 }, { max: 134000000, rate: 0.24 }, { max: 160000000, rate: 0.25 }, { max: 200000000, rate: 0.26 }, { max: 400000000, rate: 0.27 }, { max: 800000000, rate: 0.28 }, { max: 1400000000, rate: 0.29 }, { max: Infinity, rate: 0.34 }];
const terKatB = [{ max: 6200000, rate: 0 }, { max: 6500000, rate: 0.0025 }, { max: 6850000, rate: 0.005 }, { max: 7300000, rate: 0.0075 }, { max: 9200000, rate: 0.01 }, { max: 10750000, rate: 0.015 }, { max: 11250000, rate: 0.0175 }, { max: 11600000, rate: 0.02 }, { max: 12600000, rate: 0.025 }, { max: 13600000, rate: 0.03 }, { max: 14950000, rate: 0.04 }, { max: 16400000, rate: 0.05 }, { max: 18450000, rate: 0.06 }, { max: 21850000, rate: 0.07 }, { max: 26000000, rate: 0.08 }, { max: 27700000, rate: 0.09 }, { max: 29350000, rate: 0.1 }, { max: 31450000, rate: 0.11 }, { max: 33950000, rate: 0.12 }, { max: 37100000, rate: 0.13 }, { max: 41100000, rate: 0.14 }, { max: 45800000, rate: 0.15 }, { max: 49500000, rate: 0.16 }, { max: 53800000, rate: 0.17 }, { max: 58500000, rate: 0.18 }, { max: 64000000, rate: 0.19 }, { max: 71000000, rate: 0.2 }, { max: 80000000, rate: 0.21 }, { max: 93000000, rate: 0.22 }, { max: 109000000, rate: 0.23 }, { max: 129000000, rate: 0.24 }, { max: 163000000, rate: 0.25 }, { max: 200000000, rate: 0.26 }, { max: 400000000, rate: 0.27 }, { max: 800000000, rate: 0.28 }, { max: 1400000000, rate: 0.29 }, { max: Infinity, rate: 0.34 }];
const terKatC = [{ max: 6600000, rate: 0 }, { max: 6950000, rate: 0.0025 }, { max: 7350000, rate: 0.005 }, { max: 7800000, rate: 0.0075 }, { max: 8850000, rate: 0.01 }, { max: 9800000, rate: 0.015 }, { max: 10350000, rate: 0.02 }, { max: 10700000, rate: 0.025 }, { max: 11600000, rate: 0.03 }, { max: 12600000, rate: 0.04 }, { max: 13600000, rate: 0.05 }, { max: 14950000, rate: 0.06 }, { max: 16400000, rate: 0.07 }, { max: 18450000, rate: 0.08 }, { max: 21150000, rate: 0.09 }, { max: 23400000, rate: 0.1 }, { max: 25550000, rate: 0.11 }, { max: 27650000, rate: 0.12 }, { max: 29650000, rate: 0.13 }, { max: 32650000, rate: 0.14 }, { max: 36400000, rate: 0.15 }, { max: 40900000, rate: 0.16 }, { max: 44550000, rate: 0.17 }, { max: 48450000, rate: 0.18 }, { max: 52700000, rate: 0.19 }, { max: 57700000, rate: 0.2 }, { max: 64300000, rate: 0.21 }, { max: 72600000, rate: 0.22 }, { max: 85300000, rate: 0.23 }, { max: 103600000, rate: 0.24 }, { max: 125000000, rate: 0.25 }, { max: 157000000, rate: 0.26 }, { max: 206000000, rate: 0.27 }, { max: 337000000, rate: 0.28 }, { max: 454000000, rate: 0.29 }, { max: 550000000, rate: 0.3 }, { max: Infinity, rate: 0.34 }];

function getTerRate(brutoSebulan: number, ptkpVal: number): number {
  const tabel = ptkpVal >= 72000000 ? terKatC : ptkpVal >= 63000000 ? terKatB : terKatA;
  const row = tabel.find(r => brutoSebulan <= r.max);
  return row ? row.rate : 0.34;
}

export default function PPh21Page() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_pph21_inputs', defaultPPh21Inputs);
  const { gajiPokok, tunjanganJabatan, tunjanganTransport, tunjanganLain, bonus, ptkp, pensiun, status } = inputs;
  const setField = (k: string, v: number | string) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [metode, setMetode] = useState<'tahunan' | 'ter'>('tahunan');
  const [pajakBulan, setPajakBulan] = useState(0);
  const [pajakTahun, setPajakTahun] = useState(0);
  const [thp, setThp] = useState(0);
  const [breakdown, setBreakdown] = useState<{ label: string; value: string; bold?: boolean }[]>([]);
  const [bracket, setBracket] = useState('');
  const [resultSummary, setResultSummary] = useState('');
  const [showResult, setShowResult] = useState(false);

  useScrollReveal();
  useBackToTop();

  const resetInputs = () => {
    setInputs(defaultPPh21Inputs);
    setMetode('tahunan');
    setErrors({});
    setBracket('');
    setBreakdown([]);
    setResultSummary('');
    setShowResult(false);
  };

  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    const fields = [
      { key: 'gajiPokok', value: gajiPokok, min: 1000000, max: 500000000, label: 'Gaji pokok' },
      { key: 'tunjanganJabatan', value: tunjanganJabatan, min: 0, max: 50000000, label: 'Tunjangan jabatan' },
      { key: 'tunjanganTransport', value: tunjanganTransport, min: 0, max: 50000000, label: 'Tunjangan transport' },
      { key: 'tunjanganLain', value: tunjanganLain, min: 0, max: 50000000, label: 'Tunjangan lain' },
      { key: 'bonus', value: bonus, min: 0, max: 200000000, label: 'Bonus / THR' },
      { key: 'pensiun', value: pensiun, min: 0, max: 200000, label: 'Iuran pensiun / BPJS' },
    ];
    fields.forEach(f => {
      const msg = validateInput(f.value, { min: f.min, max: f.max, required: true, label: f.label });
      if (msg) e[f.key] = msg;
    });
    if (status !== 'tetap' && status !== 'freelance') e.status = 'Pilih status pekerja.';
    setErrors(e);
    if (Object.keys(e).length) {
      setShowResult(false);
      return;
    }

    const isTetap = status === 'tetap';
    const tunjanganTotal = tunjanganJabatan + tunjanganTransport + tunjanganLain;
    const brutoBulanan = gajiPokok + tunjanganTotal;
    const brutoTahunan = brutoBulanan * 12 + bonus;
    const biayaJabatan = Math.min(brutoTahunan * 0.05, 6000000);
    const pensiunEfektif = isTetap ? Math.min(pensiun, 200000) : 0;
    const pensiunSetahun = pensiunEfektif * 12;
    const pkp = Math.max(0, brutoTahunan - biayaJabatan - pensiunSetahun - ptkp);

    if (metode === 'ter') {
      const rate = getTerRate(brutoBulanan, ptkp);
      const pajakTerBulan = brutoBulanan * rate;
      const thpTer = brutoBulanan - pajakTerBulan - pensiunEfektif;
      setPajakBulan(pajakTerBulan);
      setPajakTahun(pajakTerBulan * 12);
      setThp(Math.max(0, thpTer));
      setBracket(`TER ${(rate * 100).toFixed(1)}%`);
      setBreakdown([
        { label: 'Gaji Pokok / Bulan', value: formatRupiah(gajiPokok) },
        { label: 'Tunjangan Jabatan', value: formatRupiah(tunjanganJabatan) },
        { label: 'Tunjangan Transport', value: formatRupiah(tunjanganTransport) },
        { label: 'Tunjangan Lainnya', value: formatRupiah(tunjanganLain) },
        { label: 'Total Bruto Bulanan', value: formatRupiah(brutoBulanan), bold: true },
        { label: 'Tarif TER yang berlaku', value: `${(rate * 100).toFixed(1)}%` },
        { label: 'PPh 21 Bulanan (TER)', value: `-${formatRupiah(pajakTerBulan)}`, bold: true },
        { label: 'THP Bulanan', value: formatRupiah(Math.max(0, thpTer)), bold: true },
      ]);
      setResultSummary(
        `${isTetap ? 'Karyawan tetap' : 'Freelancer'} dipotong sekitar ${formatRupiah(pajakTerBulan)} per bulan (METODE TER ${(rate * 100).toFixed(1)}%). THP sekitar ${formatRupiah(Math.max(0, thpTer))} setelah potongan pajak dan ${isTetap ? 'iuran pensiun' : 'pemotongan lainnya'}.`
      );
      setShowResult(true);
      return;
    }

    let pajak = 0;
    if (pkp <= 60000000) pajak = pkp * 0.05;
    else if (pkp <= 250000000) pajak = 3000000 + (pkp - 60000000) * 0.15;
    else if (pkp <= 500000000) pajak = 31500000 + (pkp - 250000000) * 0.25;
    else if (pkp <= 5000000000) pajak = 93750000 + (pkp - 500000000) * 0.3;
    else pajak = 1443750000 + (pkp - 5000000000) * 0.35;

    const topBracket = pkp <= 0 ? '—' : pkp <= 60000000 ? '5%' : pkp <= 250000000 ? '15%' : pkp <= 500000000 ? '25%' : pkp <= 5000000000 ? '30%' : '35%';
    const pphBulan = pajak / 12;
    const thpVal = gajiPokok + tunjanganTotal - pphBulan - pensiunEfektif;
    setPajakBulan(pphBulan);
    setPajakTahun(pajak);
    setThp(thpVal);
    setBracket(topBracket);
    setBreakdown([
      { label: 'Total Bruto Setahun', value: formatRupiah(brutoTahunan) },
      { label: '(-) Biaya Jabatan 5% (max Rp 6jt)', value: `-${formatRupiah(biayaJabatan)}` },
      { label: '(-) Iuran Pensiun / BPJS', value: `-${formatRupiah(pensiunEfektif * 12)}` },
      { label: '(-) PTKP', value: `-${formatRupiah(ptkp)}` },
      { label: 'PKP', value: formatRupiah(pkp), bold: true },
      { label: 'Total PPh 21 Setahun', value: formatRupiah(pajak), bold: true },
      { label: 'Take Home Pay / Bulan', value: formatRupiah(thpVal), bold: true },
    ]);
    setResultSummary(
      `${isTetap ? 'Karyawan tetap' : 'Freelancer'} memiliki PKP ${formatRupiah(pkp)} dengan tarif tertinggi ${topBracket}. Estimasi pajak setahun ${formatRupiah(pajak)}, atau ${formatRupiah(pphBulan)} per bulan, meninggalkan THP ${formatRupiah(thpVal)} setelah potongan.`
    );
    setShowResult(true);
  }, [gajiPokok, tunjanganJabatan, tunjanganTransport, tunjanganLain, bonus, ptkp, pensiun, status, metode]);

  useEffect(() => {
    const t = setTimeout(hitung, 300);
    return () => clearTimeout(t);
  }, [hitung]);

  return (
    <>
      <script type="application/ld+json">{schemaData}</script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="PPh 21 Calculator" />
      <div className="tool-hero-wrapper">
        <ToolHero icon="📋" badge="PAJAK PENGHASILAN" title="PPh 21 Calculator" subtitle="Hitung pajak penghasilan karyawan sesuai tarif progresif & PTKP terbaru 2025. Lengkap dengan breakdown tunjangan dan status pekerja." tags={['Tarif 2025', 'Status Pekerja', 'Biaya Jabatan', 'Breakdown Detail']} />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>PPh 21 robot</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle className="robot-antenna" cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8" />
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53" />
            <circle className="robot-eye" cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="35" cy="33" r="2.5" fill="#fff" />
            <circle className="robot-eye" cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="55" cy="33" r="2.5" fill="#fff" />
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6" />
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448" />
            <rect className="robot-badge" x="38" y="62" width="14" height="18" rx="4" fill="#0D9488" opacity="0.8" />
            <text x="45" y="75" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">%</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <g className="robot-doc">
              <rect x="72" y="44" width="18" height="22" rx="3" fill="#fff" stroke="#0D9488" strokeWidth="1.5" />
              <line x1="75" y1="51" x2="87" y2="51" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="75" y1="55" x2="87" y2="55" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="75" y1="59" x2="83" y2="59" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>
      <ToolLayout sidebar={
        <>
          <TipsCard title="💡 Tips Pajak" items={[
            { icon: '📋', text: 'PTKP 2025: TK/0 = Rp 54 juta/tahun, K/3 = Rp 72 juta/tahun.' },
            { icon: '💰', text: 'Biaya jabatan 5% dari bruto, maksimal Rp 6 juta/tahun.' },
            { icon: '📊', text: 'Metode TER cocok untuk pemotongan bulanan; rekonsiliasi tahunan tetap diperlukan.' },
          ]} />
          <RelatedToolsCard items={[
            { icon: '💰', name: 'Kalkulator Gaji', desc: 'Take home pay bersih', href: '/tools/gaji' },
            { icon: '🛡️', name: 'BPJS Calculator', desc: 'Iuran BPJS 2025', href: '/tools/bpjs' },
            { icon: '🏢', name: 'PPh 25 / Badan', desc: 'Pajak badan usaha', href: '/tools/pph-25' },
          ]} />
          <KamusCard terms={[
            { term: 'PKP', def: 'Penghasilan Kena Pajak setelah dikurangi PTKP, biaya jabatan, dan iuran pensiun.' },
            { term: 'PTKP', def: 'Penghasilan Tidak Kena Pajak. Besaran ditentukan oleh status pernikahan dan tanggungan.' },
            { term: 'Biaya Jabatan', def: 'Pengurang penghasilan sebesar 5% dari bruto, maksimal Rp 6 juta/tahun.' },
            { term: 'THP', def: 'Take Home Pay. Gaji bersih setelah seluruh potongan pajak dan iuran.' },
            { term: 'Metode TER', def: 'Tarif tetap berdasarkan penghasilan bruto bulanan. Hanya untuk pemotongan bulanan.' },
          ]} />
          <BlogCard posts={[{ title: 'Cara Baca Slip Gaji dengan Benar', category: 'Pajak & Gaji', readTime: '4 menit', slug: 'cara-baca-slip-gaji' }, { title: 'SPT Tahunan: Panduan Lengkap untuk Karyawan', category: 'Pajak', readTime: '6 menit', slug: 'spt-tahunan-karyawan' }, { title: 'Perbedaan Gaji Bruto dan Neto', category: 'Gaji', readTime: '3 menit', slug: 'gaji-bruto-vs-neto' }]} />
        </>
      }>
        <div className="calc-card">
          <div className="metode-toggle">
            <button type="button" className={`metode-btn${metode === 'tahunan' ? ' active' : ''}`} onClick={() => setMetode('tahunan')}>📅 Metode Tahunan</button>
            <button type="button" className={`metode-btn${metode === 'ter' ? ' active' : ''}`} onClick={() => setMetode('ter')}>⚡ Metode TER (Bulanan)</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
            <div className="mode-toggle" style={{ gap: 8 }}>
              <button type="button" className={`mode-btn${status === 'tetap' ? ' active' : ''}`} onClick={() => setField('status', 'tetap')}>Karyawan Tetap</button>
              <button type="button" className={`mode-btn${status === 'freelance' ? ' active' : ''}`} onClick={() => setField('status', 'freelance')}>Freelance / Tidak Tetap</button>
            </div>
            <button type="button" onClick={resetInputs} style={{ borderRadius: 999, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', padding: '8px 14px', fontSize: 13, fontWeight: 600 }}>↺ Reset ke default</button>
          </div>
          <div className="input-grid" style={{ marginTop: 18 }}>
            <div className="input-group full">
              <label htmlFor="pph-gaji" className="input-label">Gaji Pokok /bulan</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="pph-gaji" type="text" inputMode="numeric" className={`calc-input has-prefix${errors.gajiPokok ? ' input-error' : ''}`} value={formatNumber(gajiPokok)} onChange={e => { setField('gajiPokok', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, gajiPokok: '' })); }} />
              </div>
              <input type="range" className="slider" min={1000000} max={50000000} step={500000} value={gajiPokok} onChange={e => setField('gajiPokok', +e.target.value)} />
              <div className="slider-labels"><span>Rp 1jt</span><span>Rp 50jt</span></div>
              {errors.gajiPokok && <div className="error-msg">{errors.gajiPokok}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="pph-jabatan" className="input-label">Tunjangan Jabatan /bulan</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="pph-jabatan" type="text" inputMode="numeric" className={`calc-input has-prefix${errors.tunjanganJabatan ? ' input-error' : ''}`} value={formatNumber(tunjanganJabatan)} onChange={e => { setField('tunjanganJabatan', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, tunjanganJabatan: '' })); }} />
              </div>
              {errors.tunjanganJabatan && <div className="error-msg">{errors.tunjanganJabatan}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="pph-transport" className="input-label">Tunjangan Transport /bulan</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="pph-transport" type="text" inputMode="numeric" className={`calc-input has-prefix${errors.tunjanganTransport ? ' input-error' : ''}`} value={formatNumber(tunjanganTransport)} onChange={e => { setField('tunjanganTransport', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, tunjanganTransport: '' })); }} />
              </div>
              {errors.tunjanganTransport && <div className="error-msg">{errors.tunjanganTransport}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="pph-lain" className="input-label">Tunjangan Lainnya /bulan</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="pph-lain" type="text" inputMode="numeric" className={`calc-input has-prefix${errors.tunjanganLain ? ' input-error' : ''}`} value={formatNumber(tunjanganLain)} onChange={e => { setField('tunjanganLain', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, tunjanganLain: '' })); }} />
              </div>
              {errors.tunjanganLain && <div className="error-msg">{errors.tunjanganLain}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="pph-bonus" className="input-label">Bonus / THR /tahun</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="pph-bonus" type="text" inputMode="numeric" className={`calc-input has-prefix${errors.bonus ? ' input-error' : ''}`} value={formatNumber(bonus)} onChange={e => { setField('bonus', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, bonus: '' })); }} />
              </div>
              {errors.bonus && <div className="error-msg">{errors.bonus}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="pph-ptkp" className="input-label">Status PTKP</label>
              <div className="select-wrapper">
                <select id="pph-ptkp" className="calc-select" value={ptkp} onChange={e => setField('ptkp', +e.target.value)}>
                  {ptkpOptions.map(o => <option key={o.label} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="pph-pensiun" className="input-label">Iuran Pensiun /bulan</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="pph-pensiun" type="text" inputMode="numeric" className={`calc-input has-prefix${errors.pensiun ? ' input-error' : ''}`} value={formatNumber(pensiun)} onChange={e => { setField('pensiun', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, pensiun: '' })); }} />
            </div>
              {errors.pensiun && <div className="error-msg warn">{errors.pensiun}</div>}
              {!isNaN(pensiun) && pensiun > 200000 && <div className="error-msg warn">Maksimal 200rb untuk dikurangkan.</div>}
            </div>
          </div>
          {showResult && (
            <div className="result-section show" style={{ marginTop: 32 }}>
              <div className="result-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 16 }}>
                <div className="result-card"><div className="result-label">PPh 21 / Bulan</div><div className="result-value">{formatRupiah(pajakBulan)}</div><div className="result-sub">Dipotong tiap bulan</div></div>
                <div className="result-card"><div className="result-label">PPh 21 / Tahun</div><div className="result-value">{formatRupiah(pajakTahun)}</div><div className="result-sub">Total pajak setahun</div></div>
                <div className="result-card"><div className="result-label">Take Home Pay</div><div className="result-value">{formatRupiah(thp)}</div><div className="result-sub">Gaji bersih /bulan</div></div>
              </div>
              <div style={{ borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <tbody>
                    {breakdown.map(row => (
                      <tr key={`${row.label}-${row.value}`}>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontWeight: row.bold ? 700 : 400 }}>{row.label}</td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: row.bold ? 700 : 400, color: row.bold ? 'var(--navy)' : 'var(--text)' }}>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {bracket && bracket !== '—' && <div className="bracket-badge">Bracket Tertinggi: <strong>{bracket}</strong></div>}
              <div className="action-bar">
                <button type="button" className="action-btn copy" onClick={copyResult}>📋 Copy Hasil</button>
                <button type="button" className="action-btn share" onClick={shareResult}>🔗 Share</button>
                <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
                <SaveHistoryButton
                  toolId="pph-21"
                  toolName="PPh 21 Calculator"
                  inputs={inputs}
                  result={{ pajakBulan, pajakTahun, thp }}
                  disabled={!showResult}
                />
              </div>
              <p className="result-summary" style={{ marginTop: 12 }}>{resultSummary}</p>
              <p className="calc-disclaimer">{metode === 'ter' ? '* Metode TER (PMK No. 168/2023) — tarif flat berdasarkan penghasilan bruto bulanan. Bulan Desember wajib direkonsiliasi ke tarif progresif tahunan.' : '* Metode Tahunan — tarif progresif UU HPP No. 7/2021. Untuk pemotongan bulanan Jan–Nov, perusahaan wajib gunakan Metode TER.'}</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ — PPh 21" items={faqItems} />
        </div>
      </ToolLayout>
      <MoreTools exclude="pph-21" />
      <FooterSimple />
    </>
  );
}
