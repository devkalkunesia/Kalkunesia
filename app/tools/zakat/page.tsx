'use client';
import Script from 'next/script';
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
  { question: 'Apa perbedaan zakat maal dan zakat fitrah?', answer: 'Zakat maal dikeluarkan atas harta yang sudah mencapai nisab dan haul (1 tahun). Zakat fitrah dikeluarkan di bulan Ramadhan sebelum salat Idul Fitri sebesar 2.5 kg beras per jiwa.' },
  { question: 'Berapa nisab zakat maal?', answer: 'Nisab zakat maal setara dengan 85 gram emas murni. Jika harga emas Rp 1.050.000/gram, maka nisab = 85 × Rp 1.050.000 = Rp 89.250.000.' },
  { question: 'Apakah zakat bisa mengurangi pajak?', answer: 'Ya, zakat yang dibayarkan melalui lembaga zakat resmi (BAZNAS atau LAZ yang terdaftar) dapat menjadi pengurang penghasilan kena pajak.' },
  { question: 'Kemana sebaiknya membayar zakat?', answer: 'Bayar zakat melalui BAZNAS, Dompet Dhuafa, Rumah Zakat, atau LAZ resmi lainnya yang terdaftar di Kemenag untuk mendapat bukti setor resmi.' },
];

const defaultZakatInputs = {
  totalHarta: 100000000,
  hutang: 0,
  hargaEmas: 1050000,
  penghasilan: 15000000,
  hargaBeras: 15000,
  jiwa: 4,
};

type ZakatMode = 'maal' | 'penghasilan' | 'fitrah';

export default function ZakatPage() {
  const [mode, setMode] = useState<ZakatMode>('maal');
  const [inputs, setInputs] = useLocalStorage('kalkunesia_zakat_inputs', defaultZakatInputs);
  const { totalHarta, hutang, hargaEmas, penghasilan, hargaBeras, jiwa } = inputs;
  const setField = (k: string, v: number) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  useScrollReveal(); useBackToTop();

  // Zakat Maal
  const nisabMaal = 85 * hargaEmas;
  const hartaBersih = totalHarta - hutang;
  const wajibMaal = hartaBersih >= nisabMaal;
  const zakatMaal = wajibMaal ? hartaBersih * 0.025 : 0;

  // Zakat Penghasilan
  const nisabPenghasilan = (520 * hargaBeras) / 12;
  const wajibPenghasilan = penghasilan >= nisabPenghasilan;
  const zakatPenghasilanBulan = wajibPenghasilan ? penghasilan * 0.025 : 0;
  const zakatPenghasilanTahun = zakatPenghasilanBulan * 12;

  // Zakat Fitrah
  const berasPerJiwa = 2.5;
  const totalBeras = jiwa * berasPerJiwa;
  const zakatFitrah = totalBeras * hargaBeras;

  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    if (mode === 'maal') {
      const v = validateInput(totalHarta, { min: 0, required: true, label: 'Total harta' });
      if (v) e.totalHarta = v;
    } else if (mode === 'penghasilan') {
      const v = validateInput(penghasilan, { min: 0, required: true, label: 'Penghasilan' });
      if (v) e.penghasilan = v;
    } else {
      const v = validateInput(jiwa, { min: 1, max: 50, required: true, label: 'Jumlah jiwa' });
      if (v) e.jiwa = v;
    }
    setErrors(e);
    if (Object.keys(e).length) {
      setShow(false);
      return;
    }
    setShow(true);
  }, [mode, totalHarta, penghasilan, jiwa]);

  useEffect(() => { const t = setTimeout(hitung, 300); return () => clearTimeout(t); }, [hitung]);

  const resetZakat = () => {
    setInputs(defaultZakatInputs);
    setMode('maal');
    setErrors({});
    setShow(false);
  };

  const getResult = () => {
    if (mode === 'maal') return { zakatMaal, nisabMaal, wajibMaal };
    if (mode === 'penghasilan') return { zakatPenghasilanBulan, zakatPenghasilanTahun, nisabPenghasilan, wajibPenghasilan };
    return { zakatFitrah, totalBeras };
  };

  const activeZakat = mode === 'maal' ? zakatMaal : mode === 'penghasilan' ? zakatPenghasilanBulan : zakatFitrah;

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
      <Script id="zakat-schema" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Kalkulator Zakat — Kalkunesia',
          description: 'Hitung zakat maal, penghasilan, dan fitrah.',
          url: 'https://kalkunesia.com/tools/zakat',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web Browser',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
          provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
        })}
      </Script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Kalkulator Zakat" />
      <div className="tool-hero-wrapper">
        <ToolHero
          icon="☪️"
          badge="2.5%"
          title="Kalkulator Zakat"
          subtitle="Hitung zakat maal, zakat penghasilan, dan zakat fitrah sesuai ketentuan syariah. Cek nisab dan nominal zakat wajib."
          tags={['✓ Zakat Maal', '✓ Zakat Penghasilan', '✓ Zakat Fitrah', '✓ Gratis']}
        />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot zakat</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle className="robot-antenna" cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8" />
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53" />
            <circle className="robot-eye" cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="35" cy="33" r="2.5" fill="#fff" />
            <circle className="robot-eye" cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="55" cy="33" r="2.5" fill="#fff" />
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6" />
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448" />
            <rect className="robot-badge" x="34" y="62" width="24" height="18" rx="4" fill="#0D9488" opacity="0.85" />
            <text x="46" y="75" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fff">2.5%</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <path d="M70 34c0-4.5 3.5-8 8-8 3 0 5.5 1.5 7 4-1-0.2-2-0.2-3-0.1-3.5 0.6-6 3.7-5.7 7.2 0.4 3.9 3.8 6.8 7.7 6.6-1.5 1.8-3.7 2.9-6.2 2.9-4.5 0-8-3.5-8-8.6z" fill="#2DD4BF" opacity="0.85" />
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>
      <ToolLayout
        sidebar={
          <>
            {/* <AdSenseBox size="rectangle" /> */}
            <TipsCard
              title="💡 Tips Zakat"
              items={[
                { icon: '☪️', text: 'Zakat maal dihitung dari harta yang sudah dimiliki 1 tahun (haul)' },
                { icon: '💰', text: 'Zakat penghasilan bisa dibayar bulanan (2.5% dari gaji)' },
                { icon: '🕌', text: 'Bayar melalui BAZNAS atau LAZ resmi untuk dapat bukti setor' },
                { icon: '📋', text: 'Bukti zakat bisa jadi pengurang pajak penghasilan' },
              ]}
            />
            <RelatedToolsCard
              items={[
                { icon: '📋', name: 'PPh 21 Calculator', desc: 'Pajak penghasilan 2025', href: '/tools/pph-21' },
                { icon: '📊', name: 'Budget Planner', desc: 'Anggaran 50/30/20', href: '/tools/budget' },
                { icon: '🛡️', name: 'Dana Darurat', desc: 'Hitung dana darurat ideal', href: '/tools/dana-darurat' },
              ]}
            />
            <KamusCard
              terms={[
                { term: 'Nisab', def: 'Batas minimum harta yang wajib dizakati (setara 85 gram emas).' },
                { term: 'Haul', def: 'Jangka waktu kepemilikan harta minimal satu tahun lunar sebelum wajib zakat.' },
                { term: 'Zakat Maal', def: 'Zakat atas harta yang sudah mencapai nisab dan haul, tarif 2.5%.' },
                { term: 'Zakat Fitrah', def: 'Zakat jiwa yang dikeluarkan di bulan Ramadhan, sebesar 2.5 kg beras.' },
                { term: 'BAZNAS', def: 'Badan Amil Zakat Nasional, lembaga resmi pengelola zakat nasional.' },
                { term: 'Muzakki', def: 'Orang yang wajib membayar zakat karena hartanya sudah mencapai nisab.' },
              ]}
            />
            <BlogCard
              posts={[
                { title: 'Urutan Prioritas Keuangan yang Benar', category: 'Perencanaan', readTime: '5 menit', slug: 'prioritas-keuangan' },
                { title: 'Dana Darurat: Berapa yang Ideal?', category: 'Perencanaan', readTime: '4 menit', slug: 'dana-darurat-ideal' },
              ]}
            />
            <TipsCard
              title="🏛️ OPZ Terdaftar"
              items={[
                { icon: '🟢', text: 'BAZNAS — Badan Amil Zakat Nasional' },
                { icon: '🏠', text: 'Rumah Zakat — Lembaga zakat berbasis pemberdayaan' },
                { icon: '💚', text: 'Dompet Dhuafa — Fokus pada mustahik dhuafa' },
                { icon: '🤝', text: 'Yatim Mandiri — Program kolaborasi zakat & anak yatim' },
                { icon: '🕋', text: 'LAZ Al-Azhar — Menyalurkan zakat ke program dakwah & sosial' },
              ]}
            />
          </>
        }
      >
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />Kalkulator Zakat</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['maal', 'penghasilan', 'fitrah'] as ZakatMode[]).map(m => (
              <button
                type="button"
                key={m}
                className={`mode-btn${mode === m ? ' active' : ''}`}
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700 }}
                onClick={() => {
                  setMode(m);
                  setShow(false);
                }}
              >
                {m === 'maal' ? '💰 Maal' : m === 'penghasilan' ? '💼 Penghasilan' : '🌙 Fitrah'}
              </button>
            ))}
          </div>
          {mode === 'maal' && (
            <div className="input-grid">
              <div className="input-group full">
                <label htmlFor="total-harta" className="input-label">
                  Total Harta (tabungan + emas + investasi + piutang)
                </label>
                <div className="input-wrap">
                  <span className="input-prefix">Rp</span>
                  <input
                    id="total-harta"
                    type="text"
                    inputMode="numeric"
                    className={`calc-input${errors.totalHarta ? ' input-error' : ''}`}
                    value={formatNumber(totalHarta)}
                    onChange={e => {
                      setField('totalHarta', parseNumber(e.target.value));
                      setErrors({});
                    }}
                  />
                </div>
                {errors.totalHarta && <div className="error-msg">{errors.totalHarta}</div>}
              </div>
              <div className="input-group">
                <label htmlFor="hutang" className="input-label">
                  Hutang Jatuh Tempo
                </label>
                <div className="input-wrap">
                  <span className="input-prefix">Rp</span>
                  <input
                    id="hutang"
                    type="text"
                    inputMode="numeric"
                    className="calc-input"
                    value={formatNumber(hutang)}
                    onChange={e => setField('hutang', parseNumber(e.target.value))}
                  />
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="harga-emas" className="input-label">
                  Harga Emas / gram
                </label>
                <div className="input-wrap">
                  <span className="input-prefix">Rp</span>
                  <input
                    id="harga-emas"
                    type="text"
                    inputMode="numeric"
                    className="calc-input"
                    value={formatNumber(hargaEmas)}
                    onChange={e => setField('hargaEmas', parseNumber(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
          {mode === 'penghasilan' && (
            <div className="input-grid">
              <div className="input-group full">
                <label htmlFor="penghasilan-bulan" className="input-label">
                  Penghasilan Bersih per Bulan (netto)
                </label>
                <div className="input-wrap">
                  <span className="input-prefix">Rp</span>
                  <input
                    id="penghasilan-bulan"
                    type="text"
                    inputMode="numeric"
                    className={`calc-input${errors.penghasilan ? ' input-error' : ''}`}
                    value={formatNumber(penghasilan)}
                    onChange={e => {
                      setField('penghasilan', parseNumber(e.target.value));
                      setErrors({});
                    }}
                  />
                </div>
                {errors.penghasilan && <div className="error-msg">{errors.penghasilan}</div>}
              </div>
              <div className="input-group">
                <label htmlFor="harga-beras-penghasilan" className="input-label">
                  Harga Beras / kg
                </label>
                <div className="input-wrap">
                  <span className="input-prefix">Rp</span>
                  <input
                    id="harga-beras-penghasilan"
                    type="text"
                    inputMode="numeric"
                    className="calc-input"
                    value={formatNumber(hargaBeras)}
                    onChange={e => setField('hargaBeras', parseNumber(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
          {mode === 'fitrah' && (
            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="jumlah-jiwa" className="input-label">
                  Jumlah Jiwa
                </label>
                <div className="input-wrap">
                  <input
                    id="jumlah-jiwa"
                    type="text"
                    inputMode="numeric"
                    className={`calc-input${errors.jiwa ? ' input-error' : ''}`}
                    value={jiwa}
                    onChange={e => {
                      setField('jiwa', parseNumber(e.target.value));
                      setErrors({});
                    }}
                    min={1}
                    max={50}
                  />
                </div>
                {errors.jiwa && <div className="error-msg">{errors.jiwa}</div>}
              </div>
              <div className="input-group">
                <label htmlFor="harga-beras-fitrah" className="input-label">
                  Harga Beras / kg
                </label>
                <div className="input-wrap">
                  <span className="input-prefix">Rp</span>
                  <input
                    id="harga-beras-fitrah"
                    type="text"
                    inputMode="numeric"
                    className="calc-input"
                    value={formatNumber(hargaBeras)}
                    onChange={e => setField('hargaBeras', parseNumber(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
          {show && (
            <div className="result-section show">
              <div className="result-divider" />
              <div className="result-title-label">
                Hasil Perhitungan Zakat {mode === 'maal' ? 'Maal' : mode === 'penghasilan' ? 'Penghasilan' : 'Fitrah'}
              </div>
              {mode === 'maal' && (
                <>
                  {!wajibMaal && (
                    <div
                      style={{
                        background: 'rgba(13,148,136,.08)',
                        border: '1px solid rgba(13,148,136,.2)',
                        borderRadius: 12,
                        padding: 14,
                        marginBottom: 16,
                        fontSize: 13,
                        color: 'var(--teal)',
                      }}
                    >
                      ℹ️ Harta bersih {formatRupiah(hartaBersih)} belum mencapai nisab {formatRupiah(nisabMaal)} — belum wajib zakat maal
                    </div>
                  )}
                  <div className="result-grid">
                    <div className="result-card highlight">
                      <div className="result-label">Zakat Maal</div>
                      <div className="result-value">{formatRupiah(zakatMaal)}</div>
                      <div className="result-sub">2.5% dari harta bersih</div>
                    </div>
                    <div className="result-card">
                      <div className="result-label">Nisab</div>
                      <div className="result-value">{formatRupiah(nisabMaal)}</div>
                      <div className="result-sub">85 gram emas</div>
                    </div>
                    <div className="result-card">
                      <div className="result-label">Status</div>
                      <div className="result-value" style={{ fontSize: 18 }}>
                        {wajibMaal ? '✅ Wajib' : '❌ Belum Wajib'}
                      </div>
                      <div className="result-sub">Harta bersih: {formatRupiah(hartaBersih)}</div>
                    </div>
                  </div>
                </>
              )}
              {mode === 'penghasilan' && (
                <>
                  {!wajibPenghasilan && (
                    <div
                      style={{
                        background: 'rgba(13,148,136,.08)',
                        border: '1px solid rgba(13,148,136,.2)',
                        borderRadius: 12,
                        padding: 14,
                        marginBottom: 16,
                        fontSize: 13,
                        color: 'var(--teal)',
                      }}
                    >
                      ℹ️ Penghasilan {formatRupiah(penghasilan)} belum mencapai nisab {formatRupiah(Math.round(nisabPenghasilan))}/bulan
                    </div>
                  )}
                  <div className="result-grid result-grid-2">
                    <div className="result-card highlight">
                      <div className="result-label">Zakat / Bulan</div>
                      <div className="result-value">{formatRupiah(zakatPenghasilanBulan)}</div>
                      <div className="result-sub">2.5% dari penghasilan bersih (netto)</div>
                    </div>
                    <div className="result-card">
                      <div className="result-label">Zakat / Tahun</div>
                      <div className="result-value">{formatRupiah(zakatPenghasilanTahun)}</div>
                      <div className="result-sub">Estimasi 12 bulan</div>
                    </div>
                  </div>
                </>
              )}
              {mode === 'fitrah' && (
                <div className="result-grid result-grid-2">
                  <div className="result-card highlight">
                    <div className="result-label">Total Zakat Fitrah</div>
                    <div className="result-value">{formatRupiah(zakatFitrah)}</div>
                    <div className="result-sub">{jiwa} jiwa × {berasPerJiwa} kg</div>
                  </div>
                  <div className="result-card">
                    <div className="result-label">Total Beras</div>
                    <div className="result-value">{totalBeras} kg</div>
                    <div className="result-sub">@ {formatRupiah(hargaBeras)}/kg</div>
                  </div>
                </div>
              )}
              <div className="bracket-badge">{mode === 'maal' ? `Zakat Maal: 2.5% × harta bersih` : mode === 'penghasilan' ? `Zakat Penghasilan: 2.5% × gaji` : `Zakat Fitrah: ${jiwa} jiwa × 2.5 kg beras`}</div>
              <div className="action-bar" style={{ gap: 8 }}>
                <button type="button" className="action-btn" onClick={resetZakat}>
                  🔁 Reset
                </button>
                <button type="button" className="action-btn copy" onClick={handleCopy}>
                  📋 Copy Hasil
                </button>
                <button type="button" className="action-btn share" onClick={handleShare}>
                  🔗 Share
                </button>
                <button type="button" className="action-btn pdf" onClick={exportPDF}>
                  📄 Export PDF
                </button>
                <SaveHistoryButton
                  toolId="zakat"
                  toolName="Kalkulator Zakat"
                  inputs={{ mode, totalHarta, hutang, penghasilan, jiwa, hargaEmas, hargaBeras }}
                  result={getResult()}
                  disabled={!show}
                />
              </div>
              <p className="calc-disclaimer">* Perhitungan zakat berdasarkan ketentuan umum fikih. Untuk kondisi khusus atau harta yang kompleks, konsultasikan dengan ulama atau lembaga zakat resmi seperti BAZNAS.</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Kalkulator Zakat" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="zakat" /></div>
      <FooterSimple />
    </>
  );
}
