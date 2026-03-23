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
import SaveHistoryButton from '@/components/SaveHistoryButton';
import { formatRupiah, formatNumber, parseNumber, copyResult, shareResult, exportPDF, validateInput, showToast } from '@/lib/utils'
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';

const faqItems = [
  { question: 'Berapa rata-rata inflasi Indonesia?', answer: 'Rata-rata inflasi Indonesia 10 tahun terakhir sekitar 3-4% per tahun. Pada tahun tertentu bisa lebih tinggi (2022: 5.5%) atau lebih rendah (2020: 1.7%).' },
  { question: 'Bagaimana melindungi uang dari inflasi?', answer: 'Investasi di aset yang return-nya di atas inflasi: saham (10-15%/thn), properti (5-10%/thn), emas (5-8%/thn). Menyimpan cash saja akan kehilangan daya beli.' },
  { question: 'Apa dampak inflasi terhadap tabungan?', answer: 'Jika bunga tabungan 2-3% tapi inflasi 4-5%, daya beli tabungan sebenarnya turun 1-2% per tahun secara riil.' },
  { question: 'Apa itu inflasi inti?', answer: 'Inflasi inti mengecualikan harga volatile (BBM, bahan makanan) untuk melihat tren inflasi yang lebih stabil. BPS dan BI menggunakan ini sebagai acuan kebijakan.' },
];

type InflasiMode = 'depan' | 'lalu';
const proyeksiTahun = [1, 5, 10, 20, 30];
const ldJson = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Kalkulator Inflasi — Kalkunesia',
  description: 'Hitung dampak inflasi terhadap nilai uang. Proyeksi nilai uang di masa depan dan konversi dari masa lalu.',
  url: 'https://kalkunesia.com/tools/inflasi',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
  provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
});

export default function InflasiPage() {
  const [mode, setMode] = useState<InflasiMode>('depan');
  const [inputs, setInputs] = useLocalStorage('kalkunesia_inflasi_inputs', { nilai: 1000000, inflasi: 4, tahun: 10 });
  const { nilai, inflasi, tahun } = inputs;
  const setField = (k: string, v: number) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  useScrollReveal(); useBackToTop();

  const nilaiDepan = nilai / Math.pow(1 + inflasi / 100, tahun);
  const penurunanPersen = ((1 - nilaiDepan / nilai) * 100);
  const nilaiLalu = nilai / Math.pow(1 + inflasi / 100, tahun);
  const kenaikanPersen = ((nilai / nilaiLalu - 1) * 100);
  const tabelProyeksi = proyeksiTahun.map(t => ({
    tahun: t,
    nilaiSetara: mode === 'depan' ? nilai / Math.pow(1 + inflasi / 100, t) : nilai * Math.pow(1 + inflasi / 100, t),
    penurunan: mode === 'depan' ? ((1 - 1 / Math.pow(1 + inflasi / 100, t)) * 100) : ((Math.pow(1 + inflasi / 100, t) - 1) * 100),
  }));

  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    const v1 = validateInput(nilai, { min: 1000, required: true, label: 'Nilai uang' });
    if (v1) e.nilai = v1;
    const v2 = validateInput(tahun, { min: 1, max: 100, required: true, label: 'Jangka waktu' });
    if (v2) e.tahun = v2;
    setErrors(e);
    if (Object.keys(e).length) return;
    setShow(true);
  }, [nilai, tahun]);

  useEffect(() => { const t = setTimeout(hitung, 300); return () => clearTimeout(t); }, [hitung]);

  const handleCopy = () => { copyResult(); showToast('✅ Hasil disalin!'); };
  const handleShare = () => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); };

  return (
    <>
      <Script id="inflasi-ldjson" type="application/ld+json">{ldJson}</Script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Kalkulator Inflasi" />
      <div className="tool-hero-wrapper">
        <ToolHero icon="📉" badge="📉 EKONOMI" title="Kalkulator Inflasi" subtitle="Hitung dampak inflasi terhadap daya beli uang kamu. Proyeksi nilai uang di masa depan dan konversi dari masa lalu." tags={['✓ Masa Depan', '✓ Masa Lalu', '✓ Tabel Proyeksi', '✓ Gratis']} />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot asisten inflasi dengan termometer</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle className="robot-antenna" cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8" />
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53" />
            <circle className="robot-eye" cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="35" cy="33" r="2.5" fill="#fff" />
            <circle className="robot-eye" cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="55" cy="33" r="2.5" fill="#fff" />
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6" />
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448" />
            <rect className="robot-badge" x="33" y="60" width="24" height="20" rx="4" fill="#0D9488" opacity="0.9" />
            <text x="45" y="74" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">📉</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="68" y="44" width="12" height="36" rx="6" fill="#ef4444" />
            <circle cx="74" cy="82" r="8" fill="#ef4444" />
            <rect x="70" y="52" width="4" height="20" rx="2" fill="#fff" />
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>
      <ToolLayout sidebar={<>
        {/* <AdSenseBox size="rectangle" /> */}
        <TipsCard title="💡 Tips Inflasi" items={[
          { icon: '📊', text: 'Rata-rata inflasi Indonesia: 3-4% per tahun' },
          { icon: '💰', text: 'Bunga tabungan 2-3% biasanya kalah dari inflasi 4-5%' },
          { icon: '📈', text: 'Investasi saham/properti rentan mengalahkan inflasi' },
          { icon: '🏅', text: 'Emas & properti sering jadi aset lindung nilai inflasi' },
        ]} />
        <RelatedToolsCard items={[
          { icon: '💹', name: 'Compound Interest', desc: 'Simulasi bunga berbunga', href: '/tools/compound' },
          { icon: '👴', name: 'Dana Pensiun', desc: 'Perencanaan pensiun', href: '/tools/dana-pensiun' },
          { icon: '💼', name: 'Reksa Dana', desc: 'Simulasi investasi', href: '/tools/reksa-dana' },
        ]} />
        <KamusCard terms={[
          { term: 'Inflasi', def: 'Kenaikan harga barang dan jasa secara umum dalam periode tertentu.' },
          { term: 'Daya Beli', def: 'Kemampuan uang untuk membeli barang/jasa pada suatu waktu.' },
          { term: 'CPI', def: 'Consumer Price Index, indeks harga konsumen yang digunakan mengukur inflasi.' },
          { term: 'Inflasi Inti', def: 'Inflasi yang mengecualikan harga volatile seperti BBM dan bahan makanan.' },
          { term: 'Real Return', def: 'Return investasi setelah dikurangi tingkat inflasi.' },
          { term: 'Deflasi', def: 'Penurunan harga secara umum, kebalikan dari inflasi.' },
        ]} />
        <BlogCard posts={[
          { title: 'Investasi Pertama? Mulai dari Ini', category: 'Investasi', readTime: '5 menit', slug: 'investasi-pertama-pemula' },
          { title: 'Reksa Dana vs Deposito: Mana Lebih Untung?', category: 'Investasi', readTime: '5 menit', slug: 'reksa-dana-vs-deposito' },
        ]} />
      </>}>        
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />Kalkulator Inflasi</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button type="button" className={`mode-btn${mode === 'depan' ? ' active' : ''}`} style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700 }} onClick={() => { setMode('depan'); setShow(false); }}>📈 Masa Depan</button>
            <button type="button" className={`mode-btn${mode === 'lalu' ? ' active' : ''}`} style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700 }} onClick={() => { setMode('lalu'); setShow(false); }}>🕰️ Masa Lalu</button>
          </div>
          <div className="input-grid">
            <div className="input-group full"><label className="input-label" htmlFor="nilai-input">{mode === 'depan' ? 'Nilai Uang Sekarang' : 'Nilai Uang Saat Ini'}</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="nilai-input" type="text" inputMode="numeric" className={`calc-input${errors.nilai ? ' input-error' : ''}`} value={formatNumber(nilai)} onChange={e => { setField('nilai', parseNumber(e.target.value)); setErrors({}); }} /></div>{errors.nilai && <div className="error-msg">{errors.nilai}</div>}</div>
            <div className="input-group"><label className="input-label" htmlFor="inflasi-input">Tingkat Inflasi / Tahun</label><div className="input-wrap"><input id="inflasi-input" type="text" inputMode="numeric" className="calc-input" value={formatNumber(inflasi)} onChange={e => setField('inflasi', parseNumber(e.target.value))} step={0.5} /><span className="input-suffix">%</span></div></div>
            <div className="input-group"><label className="input-label" htmlFor="tahun-input">{mode === 'depan' ? 'Berapa Tahun ke Depan' : 'Berapa Tahun yang Lalu'}</label><div className="input-wrap"><input id="tahun-input" type="text" inputMode="numeric" className={`calc-input${errors.tahun ? ' input-error' : ''}`} value={tahun} onChange={e => { setField('tahun', parseNumber(e.target.value)); setErrors({}); }} min={1} max={100} /><span className="input-suffix">tahun</span></div>{errors.tahun && <div className="error-msg">{errors.tahun}</div>}</div>
          </div>
          {show && (<div>
            <div className="result-divider" />
            <div className="result-title-label">{mode === 'depan' ? 'Dampak Inflasi Masa Depan' : 'Nilai Uang di Masa Lalu'}</div>
            {mode === 'depan' ? <div className="result-grid result-grid-2">
              <div className="result-card highlight"><div className="result-label">Daya Beli dalam {tahun} Tahun</div><div className="result-value">{formatRupiah(nilaiDepan)}</div><div className="result-sub">Setara nilai hari ini</div></div>
              <div className="result-card"><div className="result-label">Penurunan Daya Beli</div><div className="result-value">-{penurunanPersen.toFixed(1)}%</div><div className="result-sub">Inflasi {inflasi}%/tahun</div></div>
            </div> : <div className="result-grid result-grid-2">
              <div className="result-card highlight"><div className="result-label">Nilai {tahun} Tahun Lalu</div><div className="result-value">{formatRupiah(nilaiLalu)}</div><div className="result-sub">Setara {formatRupiah(nilai)} hari ini</div></div>
              <div className="result-card"><div className="result-label">Kenaikan Harga</div><div className="result-value">+{kenaikanPersen.toFixed(1)}%</div><div className="result-sub">Selama {tahun} tahun</div></div>
            </div>}
            <div className="bracket-badge">Daya beli turun <strong>{penurunanPersen.toFixed(1)}%</strong> dalam {tahun} tahun pada inflasi {inflasi}%/tahun</div>
            {mode === 'depan' && (
              <div style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.15)', borderRadius: 12, padding: 14, marginBottom: 16, marginTop: 16, fontSize: 13, color: '#ef4444' }}>
                💡 {formatRupiah(nilai)} hari ini = daya beli {formatRupiah(nilaiDepan)} dalam {tahun} tahun dengan inflasi {inflasi}%
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <div className="result-title-label">Tabel Proyeksi Multi-Tahun</div>
              <table className="result-table"><thead><tr><th>Tahun</th><th>{mode === 'depan' ? 'Daya Beli Setara' : 'Harga Setara'}</th><th>{mode === 'depan' ? 'Penurunan' : 'Kenaikan'}</th></tr></thead><tbody>
                {tabelProyeksi.map(t => (
                  <tr key={t.tahun} className={t.tahun === tahun ? 'active' : ''}>
                    <td>{t.tahun} tahun</td>
                    <td className="right">{formatRupiah(t.nilaiSetara)}</td>
                    <td className="right">{mode === 'depan' ? '-' : '+'}{t.penurunan.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="action-bar">
              <button type="button" className="action-btn copy" onClick={handleCopy}>📋 Copy</button>
              <button type="button" className="action-btn share" onClick={handleShare}>🔗 Share</button>
              <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
              <SaveHistoryButton toolId="inflasi" toolName="Kalkulator Inflasi" inputs={{ mode, nilai, inflasi, tahun }} result={mode === 'depan' ? { nilaiDepan, penurunanPersen } : { nilaiLalu, kenaikanPersen }} disabled={!show} />
            </div>
            <p className="calc-disclaimer">* Perhitungan menggunakan asumsi inflasi konstan. Inflasi aktual berfluktuasi setiap tahun. Data inflasi historis Indonesia tersedia di website BPS (bps.go.id).</p>
          </div>)}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Kalkulator Inflasi" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="inflasi" /></div>
      <FooterSimple />
    </>
  );
}
