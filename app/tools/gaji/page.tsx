'use client';
import { useState, useCallback, useEffect } from 'react';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import ToolHero from '@/components/ToolHero';
import ToolLayout from '@/components/ToolLayout';
import FaqSection from '@/components/FaqSection';
import MoreTools from '@/components/MoreTools';
import { TipsCard, RelatedToolsCard, BlogCard, KamusCard } from '@/components/SidebarCards';
import { FooterSimple } from '@/components/Footer';
import { formatRupiah, formatNumber, parseNumber, copyResult, shareResult, exportPDF, validateInput } from '@/lib/utils';
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';
import SaveHistoryButton from '@/components/SaveHistoryButton';

const defaultGajiInputs = {
  gajiPokok: 8000000,
  tunjanganT: 2000000,
  tunjanganTT: 0,
  ptkp: 54000000,
  potonganLain: 0,
  status: 'tetap',
};

const statusOptions = [
  { value: 'tetap', label: 'Karyawan Tetap' },
  { value: 'kontrak', label: 'Karyawan Kontrak' },
];

const faqItems = [
  { question: 'Apa itu gaji gross vs net?', answer: 'Gaji gross adalah gaji sebelum potongan pajak dan BPJS. Gaji net (THP) adalah yang masuk rekening kamu setelah semua potongan. Pastikan saat negosiasi gaji kamu tahu yang mana yang dibicarakan.' },
  { question: 'Apakah tunjangan masuk perhitungan pajak?', answer: 'Tunjangan tetap (tunjangan makan, transport tetap) dihitung sebagai penghasilan kena pajak. Tunjangan tidak tetap (uang lembur, uang makan harian) diperlakukan berbeda.' },
  { question: 'Kapan PPh 21 dipotong?', answer: 'PPh 21 dipotong setiap bulan langsung dari gaji oleh perusahaan (pemberi kerja) sebelum gaji ditransfer ke rekening kamu.' },
  { question: 'Bagaimana jika saya punya dua pekerjaan?', answer: 'Jika punya dua sumber penghasilan, keduanya harus digabung untuk hitung total PKP setahun. Di akhir tahun, kamu perlu lapor SPT dan mungkin ada pajak tambahan yang harus dibayar.' },
];

export default function GajiPage() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_gaji_inputs', defaultGajiInputs);
  const { gajiPokok, tunjanganT, tunjanganTT, ptkp, potonganLain, status } = inputs;
  const setField = (k: string, v: number | string) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [thp, setThp] = useState(0);
  const [totalPotongan, setTotalPotongan] = useState(0);
  const [gajiKotor, setGajiKotor] = useState(0);
  const [pajakPerBulan, setPajakPerBulan] = useState(0);
  const [gajiObjekPajak, setGajiObjekPajak] = useState(0);
  const [bpjsBreakdown, setBpjsBreakdown] = useState({ bpjsKes: 0, jht: 0, jp: 0, total: 0 });
  const [rows, setRows] = useState<{ label: string; val: string; bold?: boolean }[]>([]);
  const [resultSummary, setResultSummary] = useState('');

  useScrollReveal();
  useBackToTop();
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kalkulator Gaji Bersih — Kalkunesia',
    description: 'Hitung take home pay setelah potongan PPh 21 dan BPJS.',
    url: 'https://kalkunesia.com/tools/gaji',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
    provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
  };

  const resetInputs = () => {
    setInputs(defaultGajiInputs);
    setErrors({});
    setShow(false);
    setThp(0);
    setTotalPotongan(0);
    setGajiKotor(0);
    setPajakPerBulan(0);
    setGajiObjekPajak(0);
    setBpjsBreakdown({ bpjsKes: 0, jht: 0, jp: 0, total: 0 });
    setRows([]);
    setResultSummary('');
  };

  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    const checks = [
      { key: 'gajiPokok', value: gajiPokok, min: 1000000, max: 500000000, label: 'Gaji pokok' },
      { key: 'tunjanganT', value: tunjanganT, min: 0, max: 20000000, label: 'Tunjangan tetap' },
      { key: 'tunjanganTT', value: tunjanganTT, min: 0, max: 20000000, label: 'Tunjangan tidak tetap' },
      { key: 'potonganLain', value: potonganLain, min: 0, max: 5000000, label: 'Potongan lain' },
    ];
    checks.forEach(item => {
      const msg = validateInput(item.value, { min: item.min, max: item.max, required: true, label: item.label });
      if (msg) e[item.key] = msg;
    });
    setErrors(e);
    if (Object.keys(e).length) {
      setShow(false);
      return;
    }

    const isTetap = status === 'tetap';
    const gajiObjek = gajiPokok + tunjanganT;
    const gajiKotorVal = gajiObjek + tunjanganTT;
    const capKes = 12000000;
    const dasarKes = Math.min(gajiObjek, capKes);
    const capTk = 9559600;
    const dasarTk = Math.min(gajiObjek, capTk);
    const bpjsKes = isTetap ? dasarKes * 0.01 : 0;
    const jht = isTetap ? dasarTk * 0.02 : 0;
    const jp = isTetap ? dasarTk * 0.01 : 0;
    const totalBpjs = bpjsKes + jht + jp;

    const brutoSetahun = gajiObjek * 12;
    const biayaJabatan = Math.min(brutoSetahun * 0.05, 6000000);
    const pkp = Math.max(0, brutoSetahun - biayaJabatan - totalBpjs * 12 - ptkp);

    let pajak = 0;
    if (pkp <= 60000000) pajak = pkp * 0.05;
    else if (pkp <= 250000000) pajak = 3000000 + (pkp - 60000000) * 0.15;
    else if (pkp <= 500000000) pajak = 31500000 + (pkp - 250000000) * 0.25;
    else if (pkp <= 5000000000) pajak = 93750000 + (pkp - 500000000) * 0.3;
    else pajak = 1443750000 + (pkp - 5000000000) * 0.35;

    const pphPerBulan = pajak / 12;
    const potonganTotal = pphPerBulan + totalBpjs + potonganLain;
    const thpVal = Math.max(0, gajiKotorVal - potonganTotal);
    const statusLabel = isTetap ? 'Karyawan Tetap' : 'Karyawan Kontrak';

    const breakdown = { bpjsKes, jht, jp, total: totalBpjs };

    setGajiObjekPajak(gajiObjek);
    setBpjsBreakdown(breakdown);
    setPajakPerBulan(pphPerBulan);
    setGajiKotor(gajiKotorVal);
    setTotalPotongan(potonganTotal);
    setThp(thpVal);
    setRows([
      { label: 'Status Pekerja', val: statusLabel },
      { label: 'Gaji Pokok', val: formatRupiah(gajiPokok) },
      { label: 'Tunjangan Tetap', val: formatRupiah(tunjanganT) },
      { label: 'Tunjangan Tidak Tetap', val: formatRupiah(tunjanganTT) },
      { label: 'Gaji Objek Pajak', val: formatRupiah(gajiObjek) },
      { label: 'Gaji Kotor', val: formatRupiah(gajiKotorVal), bold: true },
      { label: '(-) PPh 21 / Bulan', val: `-${formatRupiah(pphPerBulan)}` },
      { label: `(-) BPJS Kesehatan${isTetap ? '' : ' (tidak ditarik)'}`, val: `-${formatRupiah(breakdown.bpjsKes)}` },
      { label: `(-) JHT${isTetap ? '' : ' (tidak ditarik)'}`, val: `-${formatRupiah(breakdown.jht)}` },
      { label: `(-) JP${isTetap ? '' : ' (tidak ditarik)'}`, val: `-${formatRupiah(breakdown.jp)}` },
      ...(potonganLain > 0 ? [{ label: '(-) Potongan Lainnya', val: `-${formatRupiah(potonganLain)}` }] : []),
      { label: 'TAKE HOME PAY', val: formatRupiah(thpVal), bold: true },
    ]);
    setResultSummary(`Total potongan PPh 21 + BPJS sekitar ${formatRupiah(pphPerBulan + totalBpjs)} untuk ${statusLabel.toLowerCase()}, menghasilkan THP ${formatRupiah(thpVal)} setelah tambahan potongan Rp${formatRupiah(potonganLain)}.`);
    setShow(true);
  }, [gajiPokok, tunjanganT, tunjanganTT, potonganLain, ptkp, status]);

  useEffect(() => {
    const timer = setTimeout(hitung, 300);
    return () => clearTimeout(timer);
  }, [hitung]);

  return (
    <>
      <Script id="gaji-schema" type="application/ld+json">
        {JSON.stringify(schemaData)}
      </Script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Kalkulator Gaji" />
      <div className="tool-hero-wrapper">
        <ToolHero icon="💰" badge="⭐ Tools Populer" title="Kalkulator Gaji Bersih 2025" subtitle="Hitung take home pay (gaji bersih) setelah potongan PPh 21, BPJS Kesehatan, dan BPJS Ketenagakerjaan secara otomatis." tags={['✓ Potongan Lengkap', '✓ PPh 21 + BPJS', '✓ Tarif 2025', '✓ Gratis']} />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Ilustrasi robot kalkulator gaji</title>
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
            <text x="45" y="75" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">Rp</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <g className="robot-doc">
              <rect x="71" y="42" width="20" height="24" rx="3" fill="#fff" stroke="#0D9488" strokeWidth="1.5" />
              <line x1="74" y1="49" x2="88" y2="49" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="74" y1="53" x2="88" y2="53" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="74" y1="57" x2="82" y2="57" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              <text x="80" y="47" textAnchor="middle" fontSize="6" fill="#0D9488" fontWeight="bold">Rp</text>
            </g>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>
      <ToolLayout sidebar={<>
        <TipsCard title="💡 Tips Negosiasi Gaji" items={[{ icon: '📊', text: 'Hitung dulu THP kamu — Saat negosiasi, pastikan kamu tahu angka bersih yang akan diterima.' }, { icon: '💼', text: 'Tanyakan struktur gaji — Tunjangan tetap vs tidak tetap berpengaruh pada BPJS dan PPh 21.' }, { icon: '🎯', text: 'Benchmark pasar — Gunakan Glassdoor, Jobstreet, atau LinkedIn Salary untuk riset gaji.' }, { icon: '📈', text: 'Total compensation — Hitung juga nilai BPJS, asuransi, THR, dan fasilitas lain dari perusahaan.' }]} />
        <RelatedToolsCard items={[{ icon: '📋', name: 'PPh 21 Calculator', desc: 'Detail perhitungan pajak', href: '/tools/pph-21' }, { icon: '🛡️', name: 'BPJS Calculator', desc: 'Detail iuran BPJS', href: '/tools/bpjs' }, { icon: '📊', name: 'Budget Planner', desc: 'Kelola THP kamu', href: '/tools/budget' }]} />
        <KamusCard terms={[{ term: 'THP (Take Home Pay)', def: 'Gaji bersih yang masuk rekening setelah semua potongan pajak dan BPJS.' }, { term: 'Gaji Kotor', def: 'Total penghasilan sebelum dipotong apapun, termasuk gaji pokok dan semua tunjangan.' }, { term: 'Tunjangan Tetap', def: 'Tunjangan yang selalu dibayarkan teratur tanpa memandang kehadiran. Termasuk objek PPh 21.' }, { term: 'Tunjangan Tidak Tetap', def: 'Tunjangan yang berubah tergantung kehadiran atau kondisi. Tidak termasuk objek PPh 21.' }, { term: 'JHT', def: 'Jaminan Hari Tua — iuran 2% karyawan, ditanggung bersama perusahaan (3.7%).' }, { term: 'JP', def: 'Jaminan Pensiun — iuran 1% karyawan, ditanggung bersama perusahaan (2%).' }, { term: 'BPJS Kesehatan', def: 'Iuran 1% dari gaji (max Rp 12 juta) ditanggung karyawan, sisanya 4% ditanggung perusahaan.' }]} />
        <BlogCard posts={[{ title: 'Cara Baca Slip Gaji dengan Benar', category: 'Pajak & Gaji', readTime: '4 menit', slug: 'cara-baca-slip-gaji' }, { title: 'SPT Tahunan: Panduan Lengkap untuk Karyawan', category: 'Pajak', readTime: '6 menit', slug: 'spt-tahunan-karyawan' }, { title: 'Perbedaan Gaji Bruto dan Neto', category: 'Gaji', readTime: '3 menit', slug: 'gaji-bruto-vs-neto' }]} />
      </>}> 
        <div className="calc-card">
          <div className="calc-title" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="calc-title-dot" />Kalkulator Gaji Bersih 2025
            </div>
            <button type="button" onClick={resetInputs} style={{ borderRadius: 999, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', padding: '8px 14px', fontSize: 13, fontWeight: 600 }}>↺ Reset</button>
          </div>
          <div className="mode-toggle" style={{ marginTop: 16 }}>
            {statusOptions.map(option => (
              <button type="button" key={option.value} className={`mode-btn${status === option.value ? ' active' : ''}`} onClick={() => setField('status', option.value)}>{option.label}</button>
            ))}
          </div>
          <div className="input-grid" style={{ marginTop: 18 }}>
            <div className="input-group full">
              <label htmlFor="gaji-pokok" className="input-label">Gaji Pokok</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="gaji-pokok" type="text" inputMode="numeric" className={`calc-input has-prefix${errors.gajiPokok ? ' input-error' : ''}`} value={formatNumber(gajiPokok)} onChange={e => { setField('gajiPokok', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, gajiPokok: '' })); }} />
              </div>
              <input type="range" className="slider" min={1000000} max={50000000} step={500000} value={gajiPokok} onChange={e => setField('gajiPokok', +e.target.value)} />
              <div className="slider-labels"><span>Rp 1jt</span><span>Rp 50jt</span></div>
              {errors.gajiPokok && <div className="error-msg">{errors.gajiPokok}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="tunjangan-tetap" className="input-label">Tunjangan Tetap</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="tunjangan-tetap" type="text" inputMode="numeric" className={`calc-input has-prefix${errors.tunjanganT ? ' input-error' : ''}`} value={formatNumber(tunjanganT)} onChange={e => { setField('tunjanganT', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, tunjanganT: '' })); }} />
              </div>
              <input type="range" className="slider" min={0} max={20000000} step={500000} value={tunjanganT} onChange={e => setField('tunjanganT', +e.target.value)} />
              <div className="slider-labels"><span>Rp 0</span><span>Rp 20jt</span></div>
              {errors.tunjanganT && <div className="error-msg">{errors.tunjanganT}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="tunjangan-tt" className="input-label">Tunjangan Tidak Tetap</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="tunjangan-tt" type="text" inputMode="numeric" className={`calc-input has-prefix${errors.tunjanganTT ? ' input-error' : ''}`} value={formatNumber(tunjanganTT)} onChange={e => { setField('tunjanganTT', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, tunjanganTT: '' })); }} />
              </div>
              <input type="range" className="slider" min={0} max={20000000} step={500000} value={tunjanganTT} onChange={e => setField('tunjanganTT', +e.target.value)} />
              <div className="slider-labels"><span>Rp 0</span><span>Rp 20jt</span></div>
              {errors.tunjanganTT && <div className="error-msg">{errors.tunjanganTT}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="ptkp-status" className="input-label">Status PTKP</label>
              <div className="select-wrapper">
                <select id="ptkp-status" className="calc-select" value={ptkp} onChange={e => setField('ptkp', +e.target.value)}>
                  <option value={54000000}>TK/0 — Rp 54.000.000</option>
                  <option value={58500000}>K/0 — Rp 58.500.000</option>
                  <option value={63000000}>K/1 — Rp 63.000.000</option>
                  <option value={67500000}>K/2 — Rp 67.500.000</option>
                  <option value={72000000}>K/3 — Rp 72.000.000</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="potongan-lain" className="input-label">Potongan Lainnya</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="potongan-lain" type="text" inputMode="numeric" className={`calc-input has-prefix${errors.potonganLain ? ' input-error' : ''}`} value={formatNumber(potonganLain)} onChange={e => { setField('potonganLain', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, potonganLain: '' })); }} />
              </div>
              <input type="range" className="slider" min={0} max={5000000} step={50000} value={potonganLain} onChange={e => setField('potonganLain', +e.target.value)} />
              <div className="slider-labels"><span>Rp 0</span><span>Rp 5jt</span></div>
              {errors.potonganLain && <div className="error-msg">{errors.potonganLain}</div>}
            </div>
          </div>
          {show && (
            <div>
              <div className="result-divider" />
              <div className="result-title-label">Rincian Gaji Bersih</div>
              <div className="result-grid">
                <div className="result-card highlight"><div className="result-label">Take Home Pay</div><div className="result-value">{formatRupiah(thp)}</div><div className="result-sub">Yang masuk rekening</div></div>
                <div className="result-card"><div className="result-label">Total Potongan</div><div className="result-value">{formatRupiah(totalPotongan)}</div><div className="result-sub">Dari gaji kotor</div></div>
                <div className="result-card"><div className="result-label">Gaji Kotor</div><div className="result-value">{formatRupiah(gajiKotor)}</div><div className="result-sub">Sebelum potongan</div></div>
              </div>
              <div className="payslip-card" style={{ borderRadius: 12, border: '1px solid var(--border)', padding: 16, marginTop: 20, background: 'var(--surface)' }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>Payslip Singkat</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span>Gaji Bruto</span><strong>{formatRupiah(gajiKotor)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 6 }}><span>Potongan Pajak & BPJS</span><strong>{formatRupiah(pajakPerBulan + bpjsBreakdown.total)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 6 }}><span>Potongan lain</span><strong>{formatRupiah(potonganLain)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 6 }}><span>Take Home Pay</span><strong>{formatRupiah(thp)}</strong></div>
              </div>
              <table className="result-table" style={{ marginTop: 20 }}>
                <thead>
                  <tr><th>Komponen</th><th>Nilai</th></tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={`${row.label}-${row.val}`}>
                      <td>{row.bold ? <strong>{row.label}</strong> : row.label}</td>
                      <td className="right">{row.bold ? <strong>{row.val}</strong> : row.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="action-bar">
                <button type="button" className="action-btn copy" onClick={copyResult}>📋 Copy Hasil</button>
                <button type="button" className="action-btn share" onClick={shareResult}>🔗 Share</button>
                <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
                <SaveHistoryButton toolId="gaji" toolName="Kalkulator Gaji" inputs={inputs} result={{ thp, totalPotongan, gajiKotor }} disabled={!show} />
              </div>
              <p className="result-summary" style={{ marginTop: 12 }}>{resultSummary}</p>
              <p className="calc-disclaimer">* BPJS mengacu PP No. 44/2015 & Perpres No. 64/2020. PPh 21 mengacu UU HPP No. 7/2021. Tunjangan tidak tetap tidak termasuk objek PPh 21.</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Kalkulator Gaji Bersih 2025" items={faqItems} />
        </div>
      </ToolLayout>
      <MoreTools exclude="gaji" />
      <FooterSimple />
    </>
  );
}
