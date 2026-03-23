'use client';
import { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import ToolHero from '@/components/ToolHero';
import ToolLayout from '@/components/ToolLayout';
import FaqSection from '@/components/FaqSection';
import MoreTools from '@/components/MoreTools';
import { TipsCard, RelatedToolsCard, BlogCard, KamusCard } from '@/components/SidebarCards';
import { FooterSimple } from '@/components/Footer';
import SaveHistoryButton from '@/components/SaveHistoryButton';
import { formatRupiah, formatNumber, parseNumber, showToast, copyResult, shareResult, exportPDF, validateInput } from '@/lib/utils'
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';

const faqItems = [
  { question: 'Berapa 1 lot saham?', answer: '1 lot = 100 lembar saham. Ini adalah satuan minimum pembelian saham di Bursa Efek Indonesia (BEI).' },
  { question: 'Berapa fee broker beli dan jual?', answer: 'Simulasi ini menggunakan default fee beli 0.15% dan fee jual 0.25%. Besaran aktual bisa berbeda antar sekuritas.' },
  { question: 'Apa itu break even price?', answer: 'Break even price adalah harga jual minimum agar tidak rugi, dengan memperhitungkan fee beli, fee jual, dan pajak capital gain 0.1%.' },
  { question: 'Bagaimana pajak saham di Indonesia?', answer: 'Pajak capital gain saham pada simulasi ini = 0.1% dari nilai jual. Dividen dikenakan PPh Final 10% dari dividen bruto.' },
];

export default function SahamPage() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_saham_inputs', {
    aksi: 'beli' as 'beli' | 'jual', kode: '', harga: 1000, lot: 10, feeBeli: 0.15, feeJual: 0.25,
    showPL: false, hargaBeli: 800, hargaJual: 1200, lotJual: 10, dividenBruto: 0,
  });
  const { aksi, kode, harga, lot, feeBeli, feeJual, showPL, hargaBeli, hargaJual, lotJual, dividenBruto } = inputs;
  const setField = (k: string, v: number | string | boolean) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  useScrollReveal(); useBackToTop();

  const lembar = lot * 100;
  const modal = harga * lembar;
  const feeBuy = modal * feeBeli / 100;
  const totalModal = modal + feeBuy;
  const tarifCapitalGain = 0.1;
  const breakEven = totalModal / lembar / (1 - (feeJual + tarifCapitalGain) / 100);

  // P/L
  const lembarJual = lotJual * 100;
  const nilaiJual = hargaJual * lembarJual;
  const feeSell = nilaiJual * feeJual / 100;
  const pajakCapitalGain = nilaiJual * tarifCapitalGain / 100;
  const pajakDividen = dividenBruto * 0.1;
  const dividenBersih = dividenBruto - pajakDividen;
  const modalBeli = hargaBeli * lembarJual;
  const feeBuyPL = modalBeli * feeBeli / 100;
  const grossProfit = nilaiJual - modalBeli;
  const netProfit = grossProfit - feeSell - feeBuyPL - pajakCapitalGain;
  const netProfitAfterTax = netProfit + dividenBersih;
  const roi = modalBeli > 0 ? (netProfitAfterTax / (modalBeli + feeBuyPL)) * 100 : 0;

  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    const v1 = validateInput(harga, { min: 1, required: true, label: 'Harga saham' });
    if (v1) e.harga = v1;
    const v2 = validateInput(lot, { min: 1, required: true, label: 'Jumlah lot' });
    if (v2) e.lot = v2;
    setErrors(e);
    if (Object.keys(e).length) return;
    setShow(true);
  }, [harga, lot]);

  useEffect(() => { const t = setTimeout(hitung, 300); return () => clearTimeout(t); }, [hitung]);

  const handleCopy = () => {
    copyResult();
    showToast('✅ Hasil disalin!');
  };

  const handleShare = () => {
    shareResult();
    showToast('🔗 Link berhasil dibagikan!');
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Kalkulator Saham — Kalkunesia', description: 'Hitung modal, fee broker, dan profit/loss saham.', url: 'https://kalkunesia.com/tools/saham', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' }, provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' } })}</script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Kalkulator Saham" />
      <div className="tool-hero-wrapper">
        <ToolHero
          icon="📈"
          badge="BEI"
          title="Kalkulator Saham"
          subtitle="Simulasikan modal, fee broker, break even price, dan profit/loss saham BEI secara instan."
          tags={['Modal Terukur', 'Fee BEI 2025', 'Break Even Price', 'Profit/Loss']}
        />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot Kalkulator Saham</title>
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
            <text x="46" y="76" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">BEI</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="66" y="44" width="26" height="18" rx="3" fill="#fff" stroke="#0D9488" strokeWidth="1.5" />
            <line x1="69" y1="50" x2="89" y2="50" stroke="#0D9488" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="69" y1="54" x2="89" y2="54" stroke="#0D9488" strokeWidth="1.2" strokeLinecap="round" />
            <text x="79" y="60" textAnchor="middle" fontSize="6" fontWeight="700" fill="#0D9488">IDX</text>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>
      <ToolLayout sidebar={<>
        {/* <AdSenseBox size="rectangle" /> */}
        <TipsCard title="💡 Tips Saham" items={[
          { icon: '📊', text: '1 lot = 100 lembar — satuan minimum beli di BEI' },
          { icon: '💰', text: 'Simulasi terpisah antara fee jual 0.25% dan pajak capital gain 0.1%' },
          { icon: '📈', text: 'Perhatikan break even price sebelum menjual' },
          { icon: '🏦', text: 'Bandingkan fee broker antar sekuritas' }
        ]} />
        <RelatedToolsCard items={[
          { icon: '📈', name: 'ROI Calculator', desc: 'Hitung return investasi', href: '/tools/roi' },
          { icon: '💼', name: 'Reksa Dana', desc: 'Simulasi reksa dana', href: '/tools/reksa-dana' },
          { icon: '💹', name: 'Compound Interest', desc: 'Bunga berbunga', href: '/tools/compound' }
        ]} />
        <KamusCard terms={[
          { term: 'Lot', def: 'Satuan pembelian saham di BEI, 1 lot = 100 lembar saham.' },
          { term: 'Capital Gain', def: 'Keuntungan dari selisih harga beli dan harga jual saham.' },
          { term: 'Dividen', def: 'Pembagian laba perusahaan kepada pemegang saham.' },
          { term: 'Break Even', def: 'Harga jual minimum agar investor tidak mengalami kerugian.' },
          { term: 'Fee Broker', def: 'Biaya transaksi yang dibayar ke perusahaan sekuritas.' },
          { term: 'Market Cap', def: 'Nilai total perusahaan di pasar, harga saham × jumlah lembar beredar.' }
        ]} />
        <BlogCard posts={[
          { title: 'Investasi Pertama? Mulai dari Ini', category: 'Investasi', readTime: '5 menit', slug: 'investasi-pertama-pemula' },
          { title: 'Reksa Dana vs Deposito: Mana Lebih Untung?', category: 'Investasi', readTime: '5 menit', slug: 'reksa-dana-vs-deposito' }
        ]} />
      </>}> 
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />Kalkulator Saham</div>
          <div className="input-grid">
            <div className="input-group">
              <label htmlFor="kode" className="input-label">Kode Saham (opsional)</label>
              <div className="input-wrap">
                <input
                  id="kode"
                  type="text"
                  className="calc-input"
                  value={kode}
                  onChange={e => setField('kode', e.target.value.toUpperCase())}
                  placeholder="contoh: BBCA"
                  maxLength={6}
                />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="harga" className="input-label">Harga per Lembar</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input
                  id="harga"
                  type="text"
                  inputMode="numeric"
                  className={`calc-input${errors.harga ? ' input-error' : ''}`}
                  value={formatNumber(harga)}
                  onChange={e => { setField('harga', parseNumber(e.target.value)); setErrors({}); }}
                />
              </div>
              {errors.harga && <div className="error-msg">{errors.harga}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="lot" className="input-label">Jumlah Lot</label>
              <div className="input-wrap">
                <input
                  id="lot"
                  type="text"
                  inputMode="numeric"
                  className={`calc-input${errors.lot ? ' input-error' : ''}`}
                  value={lot}
                  onChange={e => { setField('lot', parseNumber(e.target.value)); setErrors({}); }}
                  min={1}
                />
              </div>
              {errors.lot && <div className="error-msg">{errors.lot}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="fee-beli" className="input-label">Fee Beli (%)</label>
              <div className="input-wrap">
                <input
                  id="fee-beli"
                  type="text"
                  inputMode="numeric"
                  className="calc-input"
                  value={formatNumber(feeBeli)}
                  onChange={e => setField('feeBeli', parseNumber(e.target.value))}
                  step={0.01}
                />
                <span className="input-suffix">%</span>
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="fee-jual" className="input-label">Fee Jual (%)</label>
              <div className="input-wrap">
                <input
                  id="fee-jual"
                  type="text"
                  inputMode="numeric"
                  className="calc-input"
                  value={formatNumber(feeJual)}
                  onChange={e => setField('feeJual', parseNumber(e.target.value))}
                  step={0.01}
                />
                <span className="input-suffix">%</span>
              </div>
            </div>
          </div>
          {/* P/L Toggle */}
          <div style={{ marginTop: 12 }}><button type="button" className={`mode-btn${showPL ? ' active' : ''}`} style={{ width: '100%', padding: '10px 0', borderRadius: 10, fontSize: 13 }} onClick={() => setField('showPL', !showPL)}>📊 Hitung Profit/Loss</button></div>
          {showPL && <div className="input-grid" style={{ marginTop: 16 }}>
            <div className="input-group">
              <label htmlFor="harga-beli" className="input-label">Harga Beli / Lembar</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input
                  id="harga-beli"
                  type="text"
                  inputMode="numeric"
                  className="calc-input"
                  value={formatNumber(hargaBeli)}
                  onChange={e => setField('hargaBeli', parseNumber(e.target.value))}
                />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="harga-jual" className="input-label">Harga Jual / Lembar</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input
                  id="harga-jual"
                  type="text"
                  inputMode="numeric"
                  className="calc-input"
                  value={formatNumber(hargaJual)}
                  onChange={e => setField('hargaJual', parseNumber(e.target.value))}
                />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="lot-jual" className="input-label">Lot Dijual</label>
              <div className="input-wrap">
                <input
                  id="lot-jual"
                  type="text"
                  inputMode="numeric"
                  className="calc-input"
                  value={formatNumber(lotJual)}
                  onChange={e => setField('lotJual', parseNumber(e.target.value))}
                  min={1}
                />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="dividen-bruto" className="input-label">Dividen Bruto (opsional)</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input
                  id="dividen-bruto"
                  type="text"
                  inputMode="numeric"
                  className="calc-input"
                  value={formatNumber(dividenBruto)}
                  onChange={e => setField('dividenBruto', parseNumber(e.target.value))}
                />
              </div>
            </div>
          </div>}
          {show && (<div>
            <div className="result-divider" />
            <div className="result-title-label">Hasil Kalkulasi {kode || 'Saham'}</div>
            <div className="result-grid">
              <div className="result-card highlight"><div className="result-label">Total Modal</div><div className="result-value">{formatRupiah(totalModal)}</div><div className="result-sub">{lembar.toLocaleString('id-ID')} lembar ({lot} lot)</div></div>
              <div className="result-card"><div className="result-label">Fee Broker Beli</div><div className="result-value">{formatRupiah(feeBuy)}</div><div className="result-sub">{feeBeli}% dari modal</div></div>
              <div className="result-card"><div className="result-label">Break Even Price</div><div className="result-value">{formatRupiah(Math.ceil(breakEven))}</div><div className="result-sub">Harga jual minimum</div></div>
            </div>
            {showPL && <>
              <div className="result-divider" />
              <div className="result-title-label">Profit / Loss</div>
              <div className="result-grid result-grid-2">
                <div className="result-card" style={{ background: netProfitAfterTax >= 0 ? 'linear-gradient(135deg, #0D9488, #14B8A6)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}><div className="result-label">Net Profit/Loss Setelah Pajak</div><div className="result-value">{netProfitAfterTax >= 0 ? '+' : ''}{formatRupiah(netProfitAfterTax)}</div><div className="result-sub">ROI: {roi.toFixed(2)}%</div></div>
                <div className="result-card"><div className="result-label">Pajak & Biaya</div><div className="result-value">{formatRupiah(feeSell + pajakCapitalGain + pajakDividen)}</div><div className="result-sub">Fee jual + pajak capital gain + pajak dividen</div></div>
              </div>
            </>}
            <div className="bracket-badge">Break Even: <strong>{formatRupiah(Math.ceil(breakEven))}/lembar</strong> — {feeBeli}% buy fee + {feeJual}% sell fee + 0.1% pajak capital gain</div>
            <table className="result-table"><thead><tr><th>Komponen</th><th>Nilai</th></tr></thead><tbody>
              <tr><td>Harga / Lembar</td><td className="right">{formatRupiah(harga)}</td></tr>
              <tr><td>Jumlah</td><td className="right">{lot} lot ({lembar.toLocaleString('id-ID')} lembar)</td></tr>
              <tr><td>Modal (excl. fee)</td><td className="right">{formatRupiah(modal)}</td></tr>
              <tr><td>Fee Beli ({feeBeli}%)</td><td className="right">{formatRupiah(feeBuy)}</td></tr>
              <tr><td>Asumsi Pajak Capital Gain</td><td className="right">0.1% dari nilai jual</td></tr>
              <tr><td><strong>Total Modal</strong></td><td className="right"><strong>{formatRupiah(totalModal)}</strong></td></tr>
              <tr><td>Break Even Price</td><td className="right">{formatRupiah(Math.ceil(breakEven))}/lembar</td></tr>
              {showPL && <>
                <tr><td>Pajak Capital Gain (0.1%)</td><td className="right">{formatRupiah(pajakCapitalGain)}</td></tr>
                <tr><td>Pajak Dividen (10%)</td><td className="right">{formatRupiah(pajakDividen)}</td></tr>
                <tr><td>Dividen Bersih</td><td className="right">{formatRupiah(dividenBersih)}</td></tr>
              </>}
            </tbody></table>
            <div className="action-bar">
              <button type="button" className="action-btn copy" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>📋 Copy</button>
              <button type="button" className="action-btn share" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>🔗 Share</button>
              <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
              <SaveHistoryButton toolId="saham" toolName="Kalkulator Saham" inputs={{ kode, harga, lot, feeBeli, feeJual }} result={{ totalModal, feeBuy, breakEven: Math.ceil(breakEven), ...(showPL ? { netProfitAfterTax, roi, pajakCapitalGain, pajakDividen } : {}) }} disabled={!show} />
            </div>
            <p className="calc-disclaimer">* Fee broker bervariasi per sekuritas. Simulasi ini memisahkan fee jual (0.25%) dan pajak capital gain (0.1%) agar komponen biaya terlihat jelas. Dividen dikenakan PPh Final 10%.</p>
          </div>)}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Kalkulator Saham" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="saham" /></div>
      <FooterSimple />
    </>
  );
}
