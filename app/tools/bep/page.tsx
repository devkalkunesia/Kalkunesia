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
import { formatRupiah, copyResult, shareResult, exportPDF, validateInput, formatNumber, parseNumber, showToast } from '@/lib/utils';
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';

type BepMode = 'unit' | 'rupiah';

type Product = {
  name: string;
  hargaJual: number;
  biayaVariabel: number;
  weight: number;
  enabled: boolean;
};

type BepInputs = {
  biayaTetap: number;
  targetProfit: number;
  mode: BepMode;
  products: Product[];
};

const defaultProducts: Product[] = [
  { name: 'Produk 1', hargaJual: 50000, biayaVariabel: 30000, weight: 1, enabled: true },
  { name: 'Produk 2', hargaJual: 45000, biayaVariabel: 28000, weight: 1, enabled: false },
  { name: 'Produk 3', hargaJual: 75000, biayaVariabel: 50000, weight: 1, enabled: false },
];

const faqItems = [
  {
    question: 'Apa itu Break Even Point?',
    answer: 'BEP adalah titik di mana total pendapatan sama dengan total biaya — tidak untung dan tidak rugi. Penting untuk mengetahui berapa minimal harus dijual.',
  },
  {
    question: 'Apa perbedaan biaya tetap dan variabel?',
    answer: 'Biaya tetap tidak berubah meskipun produksi berubah (sewa, gaji). Biaya variabel berubah sesuai volume produksi (bahan baku, kemasan).',
  },
  {
    question: 'Bagaimana menurunkan BEP?',
    answer: 'Naikkan harga jual, turunkan biaya variabel, atau kurangi biaya tetap. Bisa juga dengan meningkatkan efisiensi produksi.',
  },
  {
    question: 'Apakah BEP berlaku untuk bisnis jasa?',
    answer: 'Ya, ganti "unit" dengan "jam layanan" atau "klien". Biaya variabel per unit = biaya per jam/klien yang dilayani.',
  },
];

const schemaMarkup = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Kalkulator BEP — Kalkunesia',
  description: 'Hitung break even point usaha.',
  url: 'https://kalkunesia.com/tools/bep',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
  provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
});

export default function BEPPage() {
  const [inputs, setInputs] = useLocalStorage<BepInputs>('kalkunesia_bep_inputs', {
    biayaTetap: 10000000,
    targetProfit: 5000000,
    mode: 'unit',
    products: defaultProducts.map(p => ({ ...p })),
  });

  const { biayaTetap, targetProfit, mode, products } = inputs;
  const setField = <K extends keyof BepInputs>(key: K, value: BepInputs[K]) => setInputs(prev => ({ ...prev, [key]: value }));
  const updateProduct = (index: number, patch: Partial<Product>) =>
    setInputs(prev => ({
      ...prev,
      products: prev.products.map((product, idx) => (idx === index ? { ...product, ...patch } : product)),
    }));
  const toggleProduct = (index: number) => updateProduct(index, { enabled: !products[index].enabled });
  const resetInputs = () => {
    setInputs({
      biayaTetap: 10000000,
      targetProfit: 5000000,
      mode: 'unit',
      products: defaultProducts.map(p => ({ ...p })),
    });
    setErrors({});
    setShow(false);
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  useScrollReveal();
  useBackToTop();

  const activeProducts = products.filter(p => p.enabled);
  const totalWeight = activeProducts.reduce((sum, product) => sum + product.weight, 0);
  const totalRevenueWeight = activeProducts.reduce((sum, product) => sum + product.weight * product.hargaJual, 0);
  const totalVariableWeight = activeProducts.reduce((sum, product) => sum + product.weight * product.biayaVariabel, 0);
  const cmPerComposite = totalRevenueWeight - totalVariableWeight;
  const cmPerUnitComposite = totalWeight > 0 ? cmPerComposite / totalWeight : 0;
  const avgRevenuePerComposite = totalWeight > 0 ? totalRevenueWeight / totalWeight : 0;
  const weightedCmRatio = totalRevenueWeight > 0 ? cmPerComposite / totalRevenueWeight : 0;
  const bepUnitComposite = cmPerUnitComposite > 0 ? Math.ceil(biayaTetap / cmPerUnitComposite) : 0;
  const bepRupiah = weightedCmRatio > 0 ? Math.ceil(biayaTetap / weightedCmRatio) : 0;
  const totalTarget = biayaTetap + Math.max(0, targetProfit);
  const targetCompositeUnits = cmPerUnitComposite > 0 ? Math.ceil(totalTarget / cmPerUnitComposite) : 0;
  const targetRevenue = weightedCmRatio > 0 ? Math.ceil(totalTarget / weightedCmRatio) : 0;

  const summaryLine = !activeProducts.length
    ? 'Aktifkan minimal satu produk untuk melihat hasil BEP yang valid.'
    : mode === 'unit'
      ? `Perlu ${bepUnitComposite.toLocaleString('id-ID')} unit komposit untuk menutup biaya tetap ${formatRupiah(biayaTetap)}${targetProfit > 0 ? ` dan target profit ${formatRupiah(targetProfit)}` : ''}.`
      : `Perlu pendapatan minimal ${formatRupiah(bepRupiah)} agar biaya tetap ${formatRupiah(biayaTetap)}${targetProfit > 0 ? ` dan profit ${formatRupiah(targetProfit)}` : ''} tercapai.`;

  const hitung = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    const biayaErr = validateInput(biayaTetap, { min: 1, required: true, label: 'Biaya tetap' });
    if (biayaErr) nextErrors.biayaTetap = biayaErr;
    if (targetProfit < 0) nextErrors.targetProfit = 'Target profit tidak boleh negatif';

    const active = products.filter(p => p.enabled);
    if (!active.length) nextErrors.products = 'Aktifkan minimal satu produk dengan harga valid';

    active.forEach((product, index) => {
      const label = product.name || `Produk ${index + 1}`;
      const priceErr = validateInput(product.hargaJual, { min: 1, required: true, label: `${label} - Harga jual` });
      if (priceErr) nextErrors[`product-harga-${index}`] = priceErr;
      const variableErr = validateInput(product.biayaVariabel, { min: 0, required: true, label: `${label} - Biaya variabel` });
      if (variableErr) nextErrors[`product-variabel-${index}`] = variableErr;
      const weightErr = validateInput(product.weight, { min: 0.1, required: true, label: `${label} - Bobot penjualan` });
      if (weightErr) nextErrors[`product-weight-${index}`] = weightErr;
      if (product.biayaVariabel >= product.hargaJual) {
        nextErrors[`product-margin-${index}`] = 'Biaya variabel harus lebih kecil dari harga jual';
      }
    });

    setErrors(nextErrors);
    setShow(Object.keys(nextErrors).length === 0);
  }, [biayaTetap, targetProfit, products]);

  useEffect(() => {
    const timer = setTimeout(hitung, 300);
    return () => clearTimeout(timer);
  }, [hitung]);

  const productSummaryRows = activeProducts.map((product) => {
    const cm = product.hargaJual - product.biayaVariabel;
    const ratio = product.hargaJual > 0 ? (cm / product.hargaJual) * 100 : 0;
    const share = totalWeight > 0 ? product.weight / totalWeight : 0;
    const targetUnits = totalWeight > 0 ? Math.max(1, Math.round(bepUnitComposite * share)) : 0;
    const rowKey = `${product.name}-${product.hargaJual}-${product.biayaVariabel}-${product.weight}`;
    return (
      <tr key={rowKey}>
        <td>{product.name}</td>
        <td className="right">{formatRupiah(product.hargaJual)}</td>
        <td className="right">{formatRupiah(product.biayaVariabel)}</td>
        <td className="right">{formatRupiah(cm)}</td>
        <td className="right">{ratio.toFixed(1)}%</td>
        <td className="right">{targetUnits.toLocaleString('id-ID')} unit</td>
      </tr>
    );
  });

  return (
    <>
      <script type="application/ld+json">{schemaMarkup}</script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Kalkulator BEP" />
      <div className="tool-hero-wrapper">
        <ToolHero
          icon="📊"
          badge="BEP"
          title="Kalkulator Break Even Point"
          subtitle="Hitung titik impas untuk satu atau beberapa produk—pilih mode unit atau rupiah." 
          tags={['✓ BEP Unit', '✓ BEP Rupiah', '✓ Multi Produk', '✓ Contribution Margin']}
        />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot BEP</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle className="robot-antenna" cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8" />
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53" />
            <circle className="robot-eye" cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="35" cy="33" r="2.5" fill="#fff" />
            <circle className="robot-eye" cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="55" cy="33" r="2.5" fill="#fff" />
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6" />
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448" />
            <rect className="robot-badge" x="34" y="62" width="22" height="18" rx="4" fill="#0D9488" opacity="0.8" />
            <text x="45" y="75" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fff">BEP</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <line x1="70" y1="44" x2="88" y2="44" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <line x1="79" y1="44" x2="79" y2="62" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle cx="70" cy="54" r="5" fill="#fff" stroke="#0D9488" strokeWidth="1.5" opacity="0.85" />
            <circle cx="88" cy="54" r="5" fill="#fff" stroke="#0D9488" strokeWidth="1.5" opacity="0.85" />
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>
      <ToolLayout
        sidebar={
          <>
            <TipsCard
              title="💡 Tips BEP"
              items={[
                { icon: '📊', text: 'Pisahkan biaya tetap dan variabel dengan jelas' },
                { icon: '💰', text: 'Monitor margin kontribusi tiap produk agar mix tetap sehat' },
                { icon: '📈', text: 'Review BEP saat ada perubahan harga, biaya, atau mix produk' },
                { icon: '🏪', text: 'BEP juga berlaku untuk bisnis jasa (per jam/klien)' },
              ]}
            />
            <RelatedToolsCard
              items={[
                { icon: '💰', name: 'Harga Jual', desc: 'Hitung HPP dan margin', href: '/tools/harga-jual' },
                { icon: '📈', name: 'ROI Calculator', desc: 'Return on investment', href: '/tools/roi' },
                { icon: '🏪', name: 'PPh Final UMKM', desc: 'Pajak 0.5% omzet', href: '/tools/pph-umkm' },
              ]}
            />
            <KamusCard
              terms={[
                { term: 'BEP', def: 'Titik impas di mana total pendapatan sama dengan total biaya.' },
                { term: 'Contribution Margin', def: 'Selisih harga jual dan biaya variabel per unit.' },
                { term: 'Weighted CM Ratio', def: 'Rata-rata margin kontribusi berdasarkan porsi penjualan.' },
                { term: 'Sales Mix', def: 'Perbandingan proporsi penjualan antar produk dalam satu periode.' },
                { term: 'Target Profit', def: 'Tambahan laba yang ingin dicapai di atas BEP.' },
              ]}
            />
            <BlogCard
              posts={[
                { title: 'Tips Kelola Cashflow untuk UMKM', category: 'Bisnis', readTime: '5 menit', slug: 'kelola-cashflow-umkm' },
                { title: 'Cara Menentukan Harga Jual yang Tepat', category: 'Bisnis', readTime: '4 menit', slug: 'cara-menentukan-harga-jual' },
              ]}
            />
          </>
        }
      >
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />Kalkulator BEP</div>
          <div className="input-grid">
            <div className="input-group">
              <label className="input-label" htmlFor="bep-biaya-tetap">Biaya Tetap / Bulan</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input
                  id="bep-biaya-tetap"
                  type="text"
                  inputMode="numeric"
                  className={`calc-input${errors.biayaTetap ? ' input-error' : ''}`}
                  value={formatNumber(biayaTetap)}
                  onChange={e => {
                    setField('biayaTetap', parseNumber(e.target.value));
                    setErrors(prev => ({ ...prev, biayaTetap: '' }));
                  }}
                />
              </div>
              {errors.biayaTetap && <div className="error-msg">{errors.biayaTetap}</div>}
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="bep-target-profit">Target Profit / Bulan (opsional)</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input
                  id="bep-target-profit"
                  type="text"
                  inputMode="numeric"
                  className={`calc-input${errors.targetProfit ? ' input-error' : ''}`}
                  value={formatNumber(targetProfit)}
                  onChange={e => {
                    setField('targetProfit', parseNumber(e.target.value));
                    setErrors(prev => ({ ...prev, targetProfit: '' }));
                  }}
                />
              </div>
              {errors.targetProfit && <div className="error-msg">{errors.targetProfit}</div>}
            </div>
            <div className="input-group full">
              <div className="input-label">Mode BEP utama</div>
              <div className="mode-toggle">
                <button
                  type="button"
                  className={`mode-btn${mode === 'unit' ? ' active' : ''}`}
                  onClick={() => setField('mode', 'unit')}
                >
                  BEP Unit
                </button>
                <button
                  type="button"
                  className={`mode-btn${mode === 'rupiah' ? ' active' : ''}`}
                  onClick={() => setField('mode', 'rupiah')}
                >
                  BEP Rupiah
                </button>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            {products.map((product, index) => {
              const productKey = `${product.name}-${product.hargaJual}-${product.biayaVariabel}-${product.weight}`;
              const priceId = `product-${index}-harga`;
              const variableId = `product-${index}-variabel`;
              const weightId = `product-${index}-weight`;
              const toggleId = `product-${index}-enabled`;
              return (
                <div
                  key={productKey}
                  style={{
                    border: '1px solid rgba(15,23,42,.08)',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 12,
                    background: product.enabled ? '#fff' : 'rgba(15,23,42,.04)',
                    opacity: product.enabled ? 1 : 0.7,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <label htmlFor={toggleId} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        id={toggleId}
                        type="checkbox"
                        checked={product.enabled}
                        onChange={() => toggleProduct(index)}
                      />
                      <span>{product.name}</span>
                    </label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={e => updateProduct(index, { name: e.target.value })}
                      className="calc-input"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <div className="input-grid">
                    <div className="input-group">
                      <label className="input-label" htmlFor={priceId}>Harga Jual / Unit</label>
                      <div className="input-wrap">
                        <span className="input-prefix">Rp</span>
                        <input
                          id={priceId}
                          type="text"
                          inputMode="numeric"
                          className={`calc-input${errors[`product-harga-${index}`] ? ' input-error' : ''}`}
                          value={formatNumber(product.hargaJual)}
                          onChange={e => {
                            updateProduct(index, { hargaJual: parseNumber(e.target.value) });
                            setErrors(prev => ({ ...prev, [`product-harga-${index}`]: '' }));
                          }}
                        />
                      </div>
                      {errors[`product-harga-${index}`] && <div className="error-msg">{errors[`product-harga-${index}`]}</div>}
                    </div>
                    <div className="input-group">
                      <label className="input-label" htmlFor={variableId}>Biaya Variabel / Unit</label>
                      <div className="input-wrap">
                        <span className="input-prefix">Rp</span>
                        <input
                          id={variableId}
                          type="text"
                          inputMode="numeric"
                          className={`calc-input${errors[`product-variabel-${index}`] || errors[`product-margin-${index}`] ? ' input-error' : ''}`}
                          value={formatNumber(product.biayaVariabel)}
                          onChange={e => {
                            updateProduct(index, { biayaVariabel: parseNumber(e.target.value) });
                            setErrors(prev => ({ ...prev, [`product-variabel-${index}`]: '', [`product-margin-${index}`]: '' }));
                          }}
                        />
                      </div>
                      {(errors[`product-variabel-${index}`] || errors[`product-margin-${index}`]) && (
                        <div className="error-msg">
                          {errors[`product-variabel-${index}`] || errors[`product-margin-${index}`]}
                        </div>
                      )}
                    </div>
                    <div className="input-group">
                      <label className="input-label" htmlFor={weightId}>Bobot Penjualan (relatif)</label>
                      <div className="input-wrap">
                        <input
                          id={weightId}
                          type="number"
                          className={`calc-input${errors[`product-weight-${index}`] ? ' input-error' : ''}`}
                          min={0.1}
                          step={0.1}
                          value={product.weight}
                          onChange={e => {
                            updateProduct(index, { weight: parseNumber(e.target.value) });
                            setErrors(prev => ({ ...prev, [`product-weight-${index}`]: '' }));
                          }}
                        />
                      </div>
                      {errors[`product-weight-${index}`] && <div className="error-msg">{errors[`product-weight-${index}`]}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.products && <div className="error-msg" style={{ marginTop: 8 }}>{errors.products}</div>}
          {show && (
            <div>
              <div className="result-divider" />
              <div className="result-title-label">Hasil Analisa Break Even Point</div>
              <div className="result-grid">
                <div className={`result-card${mode === 'unit' ? ' highlight' : ''}`}>
                  <div className="result-label">BEP Komposit (Unit)</div>
                  <div className="result-value">{bepUnitComposite.toLocaleString('id-ID')} unit</div>
                  <div className="result-sub">Campuran produk</div>
                </div>
                <div className={`result-card${mode === 'rupiah' ? ' highlight' : ''}`}>
                  <div className="result-label">BEP (Rupiah)</div>
                  <div className="result-value">{formatRupiah(bepRupiah)}</div>
                  <div className="result-sub">Pendapatan minimum</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Weighted CM Ratio</div>
                  <div className="result-value">{(weightedCmRatio * 100).toFixed(1)}%</div>
                  <div className="result-sub">Kontribusi campuran</div>
                </div>
              </div>
              <div style={{ fontSize: 13, marginTop: 12, color: 'var(--muted)' }}>{summaryLine}</div>
              <div style={{ marginTop: 18 }}>
                <div className="result-title-label">BEP Point</div>
                <table className="result-table">
                  <tbody>
                    <tr>
                      <td>Revenue per mix</td>
                      <td className="right">{formatRupiah(avgRevenuePerComposite)}</td>
                    </tr>
                    <tr>
                      <td>Contribution per mix</td>
                      <td className="right">{formatRupiah(cmPerUnitComposite)}</td>
                    </tr>
                    <tr>
                      <td>Target unit (termasuk profit)</td>
                      <td className="right">{targetCompositeUnits ? `${targetCompositeUnits.toLocaleString('id-ID')} unit` : '—'}</td>
                    </tr>
                    <tr>
                      <td>Target revenue (termasuk profit)</td>
                      <td className="right">{targetRevenue ? formatRupiah(targetRevenue) : '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 18 }}>
                <div className="result-title-label">Contribution Margin per Produk</div>
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th className="right">Harga</th>
                      <th className="right">Biaya</th>
                      <th className="right">CM</th>
                      <th className="right">CM %</th>
                      <th className="right">BEP Unit</th>
                    </tr>
                  </thead>
                  <tbody>{productSummaryRows}</tbody>
                </table>
              </div>
              <div className="action-bar">
                <button type="button" className="action-btn copy" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>
                  📋 Copy Hasil
                </button>
                <button type="button" className="action-btn share" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>
                  🔗 Share
                </button>
                <button type="button" className="action-btn pdf" onClick={exportPDF}>
                  📄 Export PDF
                </button>
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => {
                    resetInputs();
                    showToast('🔄 Formulir direset');
                  }}
                  style={{ background: 'rgba(15,23,42,.06)', color: 'var(--text)' }}
                >
                  ↺ Reset
                </button>
                <SaveHistoryButton
                  toolId="bep"
                  toolName="Kalkulator BEP"
                  inputs={inputs}
                  result={{
                    bepUnitComposite,
                    bepRupiah,
                    weightedCmRatio,
                    targetCompositeUnits,
                    targetRevenue,
                  }}
                  disabled={!show}
                />
              </div>
              <p className="calc-disclaimer">* BEP dihitung dengan metode contribution margin multi-produk. Hasil ini estimasi; sesuaikan dengan perubahan harga dan biaya aktual.</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Break Even Point" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="bep" /></div>
      <FooterSimple />
    </>
  );
}
