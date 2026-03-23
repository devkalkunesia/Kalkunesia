'use client';
import Script from 'next/script';
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
import SaveHistoryButton from '@/components/SaveHistoryButton';
import { formatRupiah, formatNumber, parseNumber, copyResult, shareResult, exportPDF, validateInput, showToast } from '@/lib/utils'
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';

const faqItems = [
  { question: 'Apa perbedaan margin dan markup?', answer: 'Margin = profit / harga jual × 100%. Markup = profit / HPP × 100%. Margin 30% ≠ markup 30%. Margin selalu lebih kecil dari markup pada persentase yang sama.' },
  { question: 'Berapa margin ideal UMKM?', answer: 'Tergantung industri: makanan 30-50%, fashion 50-100%, jasa 40-60%. Riset kompetitor dan pastikan harga masih kompetitif.' },
  { question: 'Apa saja komponen HPP?', answer: 'HPP = bahan baku + tenaga kerja langsung + overhead produksi (listrik, sewa produksi, peralatan). Biaya non-produksi (marketing, admin) bukan bagian HPP.' },
  { question: 'Kapan harus menaikkan harga jual?', answer: 'Saat biaya bahan naik, saat demand tinggi, atau saat ada value-added baru. Komunikasikan kenaikan harga ke pelanggan secara transparan.' },
];

const marginOptions = [20, 25, 30, 35, 40, 50];

const defaultInputs = {
  bahanBaku: 15000,
  tenagaKerja: 5000,
  overhead: 3000,
  marketingPct: 10,
  distribusiPct: 6,
  margin: 30,
  inclPPN: false,
  competitorPrice: 0,
};

export default function HargaJualPage() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_harga_jual_inputs', defaultInputs);
  const { bahanBaku, tenagaKerja, overhead, marketingPct, distribusiPct, margin, inclPPN, competitorPrice } = inputs;
  const setField = (k: string, v: number | boolean) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  useScrollReveal(); useBackToTop();
  const resetInputs = () => {
    setInputs({ ...defaultInputs });
    setErrors({});
    setShow(false);
  };

  const hpp = bahanBaku + tenagaKerja + overhead;
  const marketingCost = (marketingPct / 100) * hpp;
  const distribusiCost = (distribusiPct / 100) * hpp;
  const totalCost = hpp + marketingCost + distribusiCost;
  const hargaJual = margin < 100 ? totalCost / (1 - margin / 100) : 0;
  const profit = hargaJual - totalCost;
  const markup = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const hargaPPN = hargaJual * 1.11;
  const competitorGap = competitorPrice > 0 ? hargaJual - competitorPrice : 0;
  const competitorNote = competitorPrice > 0
    ? competitorGap > 0
      ? `Harga ideal ${formatRupiah(hargaJual)} lebih tinggi ${formatRupiah(competitorGap)} dibanding kompetitor (${formatRupiah(competitorPrice)}).`
      : competitorGap < 0
        ? `Harga ideal lebih rendah ${formatRupiah(Math.abs(competitorGap))} — bisa lebih agresif dari kompetitor.`
        : 'Harga ideal sejajar dengan kompetitor.'
    : 'Masukkan harga kompetitor untuk membandingkan.';

  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    const hppErr = validateInput(hpp, { min: 1, required: true, label: 'HPP (bahan + tenaga + overhead)' });
    if (hppErr) e.hpp = hppErr;
    const marketingErr = validateInput(marketingPct, { min: 0, max: 100, label: 'Marketing (%)' });
    if (marketingErr) e.marketingPct = marketingErr;
    const distribusiErr = validateInput(distribusiPct, { min: 0, max: 100, label: 'Distribusi (%)' });
    if (distribusiErr) e.distribusiPct = distribusiErr;
    if (margin >= 100) e.margin = 'Margin harus kurang dari 100%';
    if (margin < 1) e.margin = 'Margin minimal 1%';
    if (competitorPrice > 0) {
      const cErr = validateInput(competitorPrice, { min: 1, label: 'Harga kompetitor' });
      if (cErr) e.competitorPrice = cErr;
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    setShow(true);
  }, [hpp, marketingPct, distribusiPct, margin, competitorPrice]);

  useEffect(() => { const t = setTimeout(hitung, 300); return () => clearTimeout(t); }, [hitung]);

  return (
    <>
      <Script id="harga-jual-ld" type="application/ld+json">
        {JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Kalkulator Harga Jual — Kalkunesia', description: 'Hitung harga jual ideal dari HPP dan margin.', url: 'https://kalkunesia.com/tools/harga-jual', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' }, provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' } })}
      </Script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Kalkulator Harga Jual" />
      <div className="tool-hero-wrapper">
        <ToolHero
          icon="💰"
          badge="Rp"
          title="Kalkulator Harga Jual"
          subtitle="Hitung harga jual ideal berdasarkan HPP dan target margin profit. Simulasi berbagai margin sekaligus."
          tags={['✓ HPP', '✓ Margin', '✓ Markup', '✓ Gratis']}
        />
        <div className="tool-hero-price-tag" aria-hidden="true">Rp</div>
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot Kalkulasi Harga Jual</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8" />
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53" />
            <circle cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle cx="35" cy="33" r="2.5" fill="#fff" />
            <circle cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle cx="55" cy="33" r="2.5" fill="#fff" />
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6" />
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448" />
            <rect x="30" y="62" width="30" height="18" rx="6" fill="#0D9488" opacity="0.9" />
            <text x="45" y="74" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">Rp</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <g>
              <rect x="66" y="46" width="18" height="30" rx="3" fill="#fff" stroke="#0D9488" strokeWidth="1.5" />
              <line x1="69" y1="52" x2="83" y2="52" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="69" y1="56" x2="83" y2="56" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="69" y1="60" x2="79" y2="60" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M68 74 L71 70 L74 74 L77 70 L80 74" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>
      <ToolLayout sidebar={<>
        {/* <AdSenseBox size="rectangle" /> */}
        <TipsCard title="💡 Tips Pricing" items={[{ icon: '📊', text: 'Margin 30% ≠ Markup 30% — pahami perbedaannya' }, { icon: '💰', text: 'Riset harga kompetitor sebelum menetapkan harga' }, { icon: '📈', text: 'Naikkan harga bertahap, bukan drastis' }, { icon: '🏪', text: 'Pastikan HPP sudah mencakup SEMUA biaya produksi' }]} />
        <RelatedToolsCard items={[{ icon: '📊', name: 'Kalkulator BEP', desc: 'Titik impas usaha', href: '/tools/bep' }, { icon: '🧾', name: 'Kalkulator PPN', desc: 'PPN 11% / 12%', href: '/tools/ppn' }, { icon: '🏪', name: 'PPh Final UMKM', desc: 'Pajak 0.5% omzet', href: '/tools/pph-umkm' }]} />
        <KamusCard terms={[
          { term: 'HPP', def: 'Harga Pokok Produksi, total biaya untuk menghasilkan satu unit produk.' },
          { term: 'Margin', def: 'Persentase keuntungan dari harga jual (profit / harga jual × 100%).' },
          { term: 'Markup', def: 'Persentase keuntungan dari HPP (profit / HPP × 100%).' },
          { term: 'BEP', def: 'Break Even Point, titik di mana total pendapatan sama dengan total biaya.' },
          { term: 'Contribution Margin', def: 'Selisih harga jual dan biaya variabel per unit.' },
          { term: 'Overhead', def: 'Biaya tidak langsung seperti sewa, listrik, dan gaji administrasi.' },
        ]} />
        <BlogCard posts={[{ title: 'Tips Kelola Cashflow untuk UMKM', category: 'Bisnis', readTime: '5 menit', slug: 'kelola-cashflow-umkm' },{ title: 'Cara Menentukan Harga Jual yang Tepat', category: 'Bisnis', readTime: '4 menit', slug: 'cara-menentukan-harga-jual' }]} />
      </>}> 
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />Kalkulator Harga Jual</div>
          <div className="input-grid">
            <div className="input-group"><label htmlFor="bahanBaku" className="input-label">Biaya Bahan Baku / Unit</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="bahanBaku" type="text" inputMode="numeric" className="calc-input" value={formatNumber(bahanBaku)} onChange={e => setField('bahanBaku', parseNumber(e.target.value))} /></div></div>
            <div className="input-group"><label htmlFor="tenagaKerja" className="input-label">Biaya Tenaga Kerja / Unit</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="tenagaKerja" type="text" inputMode="numeric" className="calc-input" value={formatNumber(tenagaKerja)} onChange={e => setField('tenagaKerja', parseNumber(e.target.value))} /></div></div>
            <div className="input-group"><label htmlFor="overhead" className="input-label">Biaya Overhead / Unit</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="overhead" type="text" inputMode="numeric" className="calc-input" value={formatNumber(overhead)} onChange={e => setField('overhead', parseNumber(e.target.value))} /></div></div>
            <div className="input-group"><label htmlFor="marketingPct" className="input-label">Marketing (%) dari HPP</label><div className="input-wrap"><input id="marketingPct" type="text" inputMode="numeric" className={`calc-input${errors.marketingPct ? ' input-error' : ''}`} value={formatNumber(marketingPct)} onChange={e => {
              setField('marketingPct', parseNumber(e.target.value));
              setErrors(prev => { const next = { ...prev }; delete next.marketingPct; return next; });
            }} /><span className="input-suffix">%</span></div>{errors.marketingPct && <div className="error-msg">{errors.marketingPct}</div>}</div>
            <div className="input-group"><label htmlFor="distribusiPct" className="input-label">Distribusi (%) dari HPP</label><div className="input-wrap"><input id="distribusiPct" type="text" inputMode="numeric" className={`calc-input${errors.distribusiPct ? ' input-error' : ''}`} value={formatNumber(distribusiPct)} onChange={e => {
              setField('distribusiPct', parseNumber(e.target.value));
              setErrors(prev => { const next = { ...prev }; delete next.distribusiPct; return next; });
            }} /><span className="input-suffix">%</span></div>{errors.distribusiPct && <div className="error-msg">{errors.distribusiPct}</div>}</div>
            <div className="input-group"><label htmlFor="margin" className="input-label">Target Margin Profit</label><div className="input-wrap"><input id="margin" type="text" inputMode="numeric" className={`calc-input${errors.margin ? ' input-error' : ''}`} value={margin} onChange={e => { setField('margin', parseNumber(e.target.value)); setErrors({}); }} min={1} max={99} /><span className="input-suffix">%</span></div>{errors.margin && <div className="error-msg">{errors.margin}</div>}</div>
            <div className="input-group"><div className="input-label">Termasuk PPN?</div><div className="mode-toggle"><button type="button" className={`mode-btn${!inclPPN ? ' active' : ''}`} onClick={() => setField('inclPPN', false)}>Tidak</button><button type="button" className={`mode-btn${inclPPN ? ' active' : ''}`} onClick={() => setField('inclPPN', true)}>Ya (11%)</button></div></div>
          </div>
          {errors.hpp && <div className="error-msg" style={{ marginTop: 8 }}>{errors.hpp}</div>}
          {show && (<div>
            <div className="result-divider" />
            <div className="result-title-label">Rekomendasi Harga Jual</div>
            <div className="result-grid">
              <div className="result-card highlight"><div className="result-label">Harga Jual{inclPPN ? ' (incl. PPN)' : ''}</div><div className="result-value">{formatRupiah(inclPPN ? hargaPPN : hargaJual)}</div><div className="result-sub">Margin {margin}%</div></div>
              <div className="result-card"><div className="result-label">HPP / Unit</div><div className="result-value">{formatRupiah(hpp)}</div><div className="result-sub">Bahan + TK + Overhead</div></div>
              <div className="result-card"><div className="result-label">Marketing + Distribusi</div><div className="result-value">{formatRupiah(marketingCost + distribusiCost)}</div><div className="result-sub">{marketingPct}% + {distribusiPct}% dari HPP</div></div>
            </div>
            <div className="bracket-badge">Markup: <strong>{markup.toFixed(1)}%</strong> — Margin: <strong>{margin}%</strong></div>
            <div style={{ marginTop: 18 }}>
              <div className="result-title-label">Rincian Komponen Biaya</div>
              <table className="result-table">
                <tbody>
                  {[
                    { label: 'Bahan Baku / Unit', value: bahanBaku },
                    { label: 'Tenaga Kerja / Unit', value: tenagaKerja },
                    { label: 'Overhead / Unit', value: overhead },
                    { label: `Marketing (${marketingPct}%)`, value: marketingCost },
                    { label: `Distribusi (${distribusiPct}%)`, value: distribusiCost },
                    { label: 'Total HPP', value: hpp, highlight: true },
                    { label: 'Total Biaya (HPP + non-produksi)', value: totalCost, highlight: true },
                  ].map(row => {
                    const pct = totalCost > 0 ? ((row.value / totalCost) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={row.label} className={row.highlight ? 'active' : ''}>
                        <td>{row.label}</td>
                        <td className="right">{formatRupiah(row.value)}</td>
                        <td className="right">{row.highlight ? '—' : `${pct}%`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
              {`Perkiraan total biaya ${formatRupiah(totalCost)} (HPP ${formatRupiah(hpp)} + marketing ${formatRupiah(marketingCost)} + distribusi ${formatRupiah(distribusiCost)}) menuju harga jual ${formatRupiah(inclPPN ? hargaPPN : hargaJual)}.`}
            </div>
            {/* Margin Comparison Table */}
            <div style={{ marginTop: 16 }}>
              <div className="result-title-label">Simulasi Berbagai Margin</div>
              <table className="result-table"><thead><tr><th>Margin</th><th>Harga Jual</th><th>Profit</th><th>Markup</th></tr></thead><tbody>
                {marginOptions.map(m => { const hj = hpp / (1 - m / 100); const pr = hj - hpp; const mk = hpp > 0 ? (pr / hpp) * 100 : 0; return (
                  <tr key={m} className={m === margin ? 'active' : ''}><td>{m}%</td><td className="right">{formatRupiah(hj)}</td><td className="right">{formatRupiah(pr)}</td><td className="right">{mk.toFixed(1)}%</td></tr>
                ); })}
              </tbody></table>
            </div>
            <div className="action-bar">
              <button type="button" className="action-btn copy" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>📋 Copy Hasil</button>
              <button type="button" className="action-btn share" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>🔗 Share</button>
              <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
              <button type="button" className="action-btn" style={{ background: 'rgba(15,23,42,.06)', color: 'var(--text)' }} onClick={resetInputs}>↺ Reset</button>
              <SaveHistoryButton toolId="harga-jual" toolName="Kalkulator Harga Jual" inputs={{ bahanBaku, tenagaKerja, overhead, marketingPct, distribusiPct, margin, inclPPN }} result={{ hpp, totalCost, hargaJual, profit, markup }} disabled={!show} />
            </div>
            <p className="calc-disclaimer">* Harga jual yang dihasilkan adalah estimasi berdasarkan HPP dan target margin. Pastikan harga tetap kompetitif dengan melakukan riset pasar sebelum menetapkan harga final.</p>
          </div>)}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Harga Jual" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="harga-jual" /></div>
      <FooterSimple />
    </>
  );
}
