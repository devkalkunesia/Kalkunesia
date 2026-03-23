'use client';
import { useState, useCallback, useEffect } from 'react';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import ToolHero from '@/components/ToolHero';
import ToolLayout from '@/components/ToolLayout';
import AdSenseBox from '@/components/AdSenseBox';
import FaqSection from '@/components/FaqSection';
import MoreTools from '@/components/MoreTools';
import { TipsCard, RelatedToolsCard, BlogCard, KamusCard } from '@/components/SidebarCards';
import { FooterSimple } from '@/components/Footer';
import SaveHistoryButton from '@/components/SaveHistoryButton';
import { formatRupiah, showToast, copyResult, shareResult, exportPDF, validateInput, formatNumber, parseNumber } from '@/lib/utils';
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';

const faqItems = [
  { question: 'Apa itu BPHTB?', answer: 'BPHTB (Bea Perolehan Hak atas Tanah dan Bangunan) adalah pajak yang dikenakan atas perolehan hak atas tanah dan/atau bangunan. Tarif nasional: 5% dari NPOPKP.' },
  { question: 'Siapa yang membayar BPHTB?', answer: 'BPHTB dibayar oleh pihak yang memperoleh hak — pembeli dalam jual beli, penerima dalam hibah, atau ahli waris dalam pewarisan.' },
  { question: 'Apa itu NPOPTKP?', answer: 'NPOPTKP (Nilai Perolehan Objek Pajak Tidak Kena Pajak) adalah batas nilai yang tidak dikenakan BPHTB. Untuk simulasi ini default umum Rp 80 juta dan waris Rp 300 juta.' },
  { question: 'Berapa BPHTB untuk waris?', answer: 'Di simulasi ini tarif BPHTB tetap 5% dari NPOPKP. Perbedaan waris terletak pada NPOPTKP default yang lebih tinggi agar mencerminkan praktik umum daerah.' },
];

const jenisTransaksi = [
  { value: 'jual-beli', label: 'Jual Beli' },
  { value: 'waris', label: 'Waris' },
  { value: 'hibah', label: 'Hibah' },
];

const DEFAULT_NPOPTKP = 80000000;
const WARIS_NPOPTKP = 300000000;

export default function BPHTBPage() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_bphtb_inputs', {
    hargaTransaksi: 500000000, njop: 450000000, jenis: 'jual-beli', kota: '', npoptkp: DEFAULT_NPOPTKP,
  });
  const { hargaTransaksi, njop, jenis, kota, npoptkp } = inputs;
  const setField = (k: string, v: number | string) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  useScrollReveal(); useBackToTop();

  useEffect(() => {
    const suggestedNpoptkp = jenis === 'waris' ? WARIS_NPOPTKP : DEFAULT_NPOPTKP;
    if (npoptkp !== suggestedNpoptkp) {
      setInputs(prev => ({ ...prev, npoptkp: suggestedNpoptkp }));
    }
  }, [jenis, npoptkp, setInputs]);

  const resetInputs = () => {
    setInputs({
      hargaTransaksi: 500000000,
      njop: 450000000,
      jenis: 'jual-beli',
      kota: '',
      npoptkp: DEFAULT_NPOPTKP,
    });
    setErrors({});
    setShow(false);
  };

  const npop = Math.max(hargaTransaksi, njop);
  const npopkp = Math.max(0, npop - npoptkp);
  const tarifBPHTB = 0.05;
  const tarifLabel = '5%';
  const npoptkpHint = jenis === 'waris'
    ? `Default ${formatRupiah(WARIS_NPOPTKP)} — banyak daerah memakai Rp 300 juta untuk waris.`
    : `Default ${formatRupiah(DEFAULT_NPOPTKP)} — sesuaikan dengan ketentuan daerah.`;
  const bphtb = npopkp * tarifBPHTB;
  const notarisMin = npop * 0.005;
  const notarisMax = npop * 0.01;
  const totalEstimasi = bphtb + notarisMax;
  const bphtbPct = npop > 0 ? (bphtb / npop * 100).toFixed(2) : '0';

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    const v1 = validateInput(hargaTransaksi, { min: 10000000, required: true, label: 'Harga transaksi' });
    if (v1) e.hargaTransaksi = v1;
    const v2 = validateInput(njop, { min: 0, required: true, label: 'NJOP' });
    if (v2) e.njop = v2;
    const v3 = validateInput(npoptkp, { min: 0, required: true, label: 'NPOPTKP' });
    if (v3) e.npoptkp = v3;
    if (!jenis) e.jenis = 'Jenis transaksi wajib dipilih';
    setErrors(e);
    if (Object.keys(e).length) return;
    setShow(true);
  }, [hargaTransaksi, njop, jenis, npoptkp]);

  useEffect(() => { const t = setTimeout(hitung, 300); return () => clearTimeout(t); }, [hitung]);

  return (
    <>
      <Script id="bphtb-ld" type="application/ld+json">
        {JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Kalkulator BPHTB — Kalkunesia', description: 'Hitung BPHTB untuk jual beli, waris, dan hibah properti.', url: 'https://kalkunesia.com/tools/bphtb', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' }, provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' } })}
      </Script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Kalkulator BPHTB" />
      <div className="tool-hero-wrapper">
        <ToolHero icon="🏠" badge="5%" title="Kalkulator BPHTB" subtitle="Hitung Bea Perolehan Hak atas Tanah dan Bangunan untuk jual beli, waris, dan hibah properti." tags={['Tarif 5%', 'NPOPKP Otomatis', 'Estimasi Notaris', 'Aman & Gratis']} />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot Kalkulator BPHTB</title>
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
            <text x="45" y="75" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">5%</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <g className="robot-doc">
              <rect x="72" y="44" width="18" height="28" rx="3" fill="#fff" stroke="#0D9488" strokeWidth="1.5" />
              <line x1="75" y1="51" x2="87" y2="51" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="75" y1="55" x2="87" y2="55" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="75" y1="59" x2="83" y2="59" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="83" cy="48" r="4" fill="#0D9488" opacity="0.85" />
              <text x="83" y="50" textAnchor="middle" fontSize="7" fontWeight="600" fill="#fff">BPHTB</text>
            </g>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>
      <ToolLayout sidebar={
        <>
          {/* <AdSenseBox size="rectangle" /> */}
          <TipsCard title="💡 Tips BPHTB" items={[
            { icon: '🏠', text: 'BPHTB harus dibayar sebelum akta jual beli ditandatangani' },
            { icon: '📋', text: 'NPOPTKP berbeda-beda tiap daerah — cek ke kantor pajak setempat' },
            { icon: '💰', text: 'BPHTB waris hanya 50% dari tarif normal (efektif 2.5%)' },
            { icon: '🏦', text: 'Pembayaran BPHTB melalui bank yang ditunjuk pemerintah daerah' },
          ]} />
          <RelatedToolsCard items={[
            { icon: '🏠', name: 'KPR Calculator', desc: 'Simulasi cicilan KPR', href: '/tools/kpr' },
            { icon: '📈', name: 'ROI Calculator', desc: 'ROI investasi properti', href: '/tools/roi' },
            { icon: '🧾', name: 'Kalkulator PPN', desc: 'PPN 11% / 12%', href: '/tools/ppn' },
          ]} />
          <KamusCard terms={[
            { term: 'BPHTB', def: 'Bea Perolehan Hak atas Tanah dan Bangunan, pajak saat membeli properti.' },
            { term: 'NJOP', def: 'Nilai Jual Objek Pajak, nilai properti yang ditetapkan pemerintah daerah.' },
            { term: 'NPOP', def: 'Nilai Perolehan Objek Pajak, nilai tertinggi antara harga transaksi dan NJOP.' },
            { term: 'NPOPTKP', def: 'Batas nilai properti yang tidak dikenakan BPHTB, berbeda tiap daerah.' },
            { term: 'AJB', def: 'Akta Jual Beli, dokumen resmi peralihan hak atas tanah dan bangunan.' },
            { term: 'PPAT', def: 'Pejabat Pembuat Akta Tanah, notaris khusus yang mengesahkan transaksi properti.' },
          ]} />
          <BlogCard posts={[
            { title: 'Beli Rumah Pertama: Checklist Lengkap', category: 'Properti', readTime: '7 menit', slug: 'checklist-beli-rumah-pertama' },
            { title: 'KPR Subsidi vs Non-Subsidi: Pilih Mana?', category: 'Properti', readTime: '5 menit', slug: 'kpr-subsidi-vs-non-subsidi' },
          ]} />
        </>
      }>
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />Kalkulator BPHTB</div>
          <div className="input-grid">
            <div className="input-group">
              <label htmlFor="hargaTransaksi" className="input-label">Harga Transaksi</label>
              <div className="input-wrap"><span className="input-prefix">Rp</span><input id="hargaTransaksi" type="text" inputMode="numeric" className={`calc-input${errors.hargaTransaksi ? ' input-error' : ''}`} value={formatNumber(hargaTransaksi)} onChange={e => { setField('hargaTransaksi', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, hargaTransaksi: '' })); }} /></div>
              {errors.hargaTransaksi && <div className="error-msg">{errors.hargaTransaksi}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="njop" className="input-label">NJOP (Nilai Jual Objek Pajak)</label>
              <div className="input-wrap"><span className="input-prefix">Rp</span><input id="njop" type="text" inputMode="numeric" className={`calc-input${errors.njop ? ' input-error' : ''}`} value={formatNumber(njop)} onChange={e => { setField('njop', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, njop: '' })); }} /></div>
              {errors.njop && <div className="error-msg">{errors.njop}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="jenis" className="input-label">Jenis Transaksi</label>
              <div className="select-wrapper">
                <select id="jenis" className="calc-select" value={jenis} onChange={e => setField('jenis', e.target.value)}>
                  {jenisTransaksi.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="kota" className="input-label">Kota / Kabupaten (referensi)</label>
              <div className="input-wrap"><input id="kota" type="text" className="calc-input" value={kota} onChange={e => setField('kota', e.target.value)} placeholder="contoh: Jakarta Selatan" /></div>
            </div>
            <div className="input-group full">
              <label htmlFor="npoptkp" className="input-label">NPOPTKP (Tidak Kena Pajak)</label>
              <div className="input-wrap"><span className="input-prefix">Rp</span><input id="npoptkp" type="text" inputMode="numeric" className="calc-input" value={formatNumber(npoptkp)} onChange={e => setField('npoptkp', parseNumber(e.target.value))} /></div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{npoptkpHint}</div>
            </div>
          </div>
          {show && (<div>
            <div className="result-divider" />
            <div className="result-title-label">Hasil Perhitungan BPHTB</div>
            {jenis === 'waris' && <div style={{ background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, color: '#92400E' }}>ℹ️ Simulasi waris menggunakan NPOPTKP default lebih tinggi ({formatRupiah(WARIS_NPOPTKP)}), dengan tarif BPHTB tetap 5%.</div>}
            <div className="result-grid">
              <div className="result-card highlight"><div className="result-label">BPHTB Terutang</div><div className="result-value">{formatRupiah(bphtb)}</div><div className="result-sub">Tarif {(tarifBPHTB * 100).toFixed(1)}%</div></div>
              <div className="result-card"><div className="result-label">NPOP</div><div className="result-value">{formatRupiah(npop)}</div><div className="result-sub">max(Harga, NJOP)</div></div>
              <div className="result-card"><div className="result-label">Estimasi Notaris</div><div className="result-value">{formatRupiah(notarisMin)} — {formatRupiah(notarisMax)}</div><div className="result-sub">0.5% — 1% dari NPOP</div></div>
            </div>
            <div className="bracket-badge">BPHTB: <strong>{bphtbPct}%</strong> dari nilai properti</div>
            <table className="result-table"><thead><tr><th>Komponen</th><th>Nilai</th></tr></thead><tbody>
              <tr><td>Harga Transaksi</td><td className="right">{formatRupiah(hargaTransaksi)}</td></tr>
              <tr><td>NJOP</td><td className="right">{formatRupiah(njop)}</td></tr>
              <tr><td>NPOP (yang lebih tinggi)</td><td className="right">{formatRupiah(npop)}</td></tr>
              <tr><td>NPOPTKP</td><td className="right">{formatRupiah(npoptkp)}</td></tr>
              <tr><td>NPOPKP</td><td className="right">{formatRupiah(npopkp)}</td></tr>
              <tr><td>Tarif BPHTB</td><td className="right">{(tarifBPHTB * 100).toFixed(1)}%</td></tr>
              <tr><td><strong>BPHTB Terutang</strong></td><td className="right"><strong>{formatRupiah(bphtb)}</strong></td></tr>
              <tr><td>Estimasi Biaya Notaris</td><td className="right">{formatRupiah(notarisMin)} — {formatRupiah(notarisMax)}</td></tr>
              <tr><td><strong>Total Estimasi Biaya</strong></td><td className="right"><strong>{formatRupiah(totalEstimasi)}</strong></td></tr>
            </tbody></table>
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
              {`BPHTB = ${tarifLabel} × (NPOP - NPOPTKP) = ${formatRupiah(bphtb)} (${formatRupiah(npopkp)} dikenakan pajak).`}
            </div>
            <div className="action-bar">
              <button type="button" className="action-btn copy" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>📋 Copy</button>
              <button type="button" className="action-btn share" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>🔗 Share</button>
              <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
              <button
                type="button"
                className="action-btn"
                style={{ background: 'rgba(15,23,42,.06)', color: 'var(--text)' }}
                onClick={resetInputs}
              >
                ↺ Reset
              </button>
              <SaveHistoryButton toolId="bphtb" toolName="Kalkulator BPHTB" inputs={{ hargaTransaksi, njop, jenis, npoptkp }} result={{ bphtb, npop, npopkp, totalEstimasi }} disabled={!show} />
            </div>
            <p className="calc-disclaimer">* Perhitungan berdasarkan UU No. 28/2009 tentang Pajak Daerah. Tarif BPHTB 5% adalah tarif maksimal — daerah tertentu mungkin menerapkan tarif berbeda. NPOPTKP berbeda tiap kota/kabupaten.</p>
          </div>)}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Kalkulator BPHTB" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="bphtb" /></div>
      <FooterSimple />
    </>
  );
}
