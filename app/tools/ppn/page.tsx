'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import ToolHero from '@/components/ToolHero';
import ToolLayout from '@/components/ToolLayout';
import AdSenseBox from '@/components/AdSenseBox';
import FaqSection from '@/components/FaqSection';
import MoreTools from '@/components/MoreTools';
import { BlogCard, KamusCard, RelatedToolsCard, TipsCard } from '@/components/SidebarCards';
import { FooterSimple } from '@/components/Footer';
import SaveHistoryButton from '@/components/SaveHistoryButton';
import { copyResult, exportPDF, formatNumber, formatRupiah, parseNumber, shareResult, validateInput } from '@/lib/utils';
import { useBackToTop, useLocalStorage, useScrollReveal } from '@/lib/hooks';

type PriceMode = 'belum-termasuk' | 'termasuk';

interface Inputs {
  amount: number;
  mode: PriceMode;
  pkpKeluaranDpp: number;
  pkpMasukanDpp: number;
}

const PPN_RATE = 0.12;

const defaults: Inputs = {
  amount: 10000000,
  mode: 'belum-termasuk',
  pkpKeluaranDpp: 25000000,
  pkpMasukanDpp: 12000000,
};

const faqItems = [
  {
    question: 'PPN 2025 berapa persen?',
    answer: 'Simulasi ini menggunakan tarif PPN umum 12% untuk tahun 2025 sesuai ketentuan terbaru.',
  },
  {
    question: 'Apa beda harga termasuk dan belum termasuk PPN?',
    answer: 'Belum termasuk berarti PPN ditambahkan di atas DPP. Termasuk berarti harga yang Anda masukkan sudah mengandung PPN, sehingga DPP dihitung balik.',
  },
  {
    question: 'Bagaimana hitung PPN PKP?',
    answer: 'PPN terutang PKP = PPN Keluaran - PPN Masukan. Jika hasil negatif, berarti posisi lebih bayar pada periode tersebut.',
  },
];

const schemaData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Kalkulator PPN 2025 — Kalkunesia',
  description: 'Hitung PPN 12% untuk harga termasuk/belum termasuk pajak dan simulasi PPN keluaran vs masukan PKP.',
  url: 'https://kalkunesia.com/tools/ppn',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
  provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
});

export default function PPNPage() {
  const [inputs, setInputs] = useLocalStorage<Inputs>('kalkunesia_ppn_inputs', defaults);
  const { amount, mode, pkpKeluaranDpp, pkpMasukanDpp } = inputs;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);

  const setField = <K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  useScrollReveal();
  useBackToTop();

  const resetInputs = () => {
    setInputs(defaults);
    setErrors({});
    setShow(false);
  };

  const priceCalc = useMemo(() => {
    if (mode === 'belum-termasuk') {
      const dpp = amount;
      const ppn = dpp * PPN_RATE;
      const total = dpp + ppn;
      return { dpp, ppn, total };
    }

    const total = amount;
    const dpp = total / (1 + PPN_RATE);
    const ppn = total - dpp;
    return { dpp, ppn, total };
  }, [amount, mode]);

  const pkpCalc = useMemo(() => {
    const ppnKeluaran = pkpKeluaranDpp * PPN_RATE;
    const ppnMasukan = pkpMasukanDpp * PPN_RATE;
    const neto = ppnKeluaran - ppnMasukan;
    return { ppnKeluaran, ppnMasukan, neto };
  }, [pkpKeluaranDpp, pkpMasukanDpp]);

  const summary =
    pkpCalc.neto >= 0
      ? `PPN neto periode ini ${formatRupiah(pkpCalc.neto)} (kurang bayar) setelah kompensasi PPN masukan. Untuk transaksi tunggal, DPP ${formatRupiah(priceCalc.dpp)} menghasilkan PPN ${formatRupiah(priceCalc.ppn)}.`
      : `PPN neto periode ini ${formatRupiah(Math.abs(pkpCalc.neto))} (lebih bayar). Pada transaksi tunggal, PPN yang terkandung adalah ${formatRupiah(priceCalc.ppn)} dari DPP ${formatRupiah(priceCalc.dpp)}.`;

  const hitung = useCallback(() => {
    const nextErrors: Record<string, string> = {};

    const amountMsg = validateInput(amount, {
      min: 1000,
      max: 100000000000,
      required: true,
      label: mode === 'belum-termasuk' ? 'Harga sebelum PPN' : 'Harga termasuk PPN',
    });
    if (amountMsg) nextErrors.amount = amountMsg;

    const outputMsg = validateInput(pkpKeluaranDpp, {
      min: 0,
      max: 100000000000,
      required: true,
      label: 'DPP Keluaran',
    });
    if (outputMsg) nextErrors.pkpKeluaranDpp = outputMsg;

    const inputMsg = validateInput(pkpMasukanDpp, {
      min: 0,
      max: 100000000000,
      required: true,
      label: 'DPP Masukan',
    });
    if (inputMsg) nextErrors.pkpMasukanDpp = inputMsg;

    setErrors(nextErrors);
    setShow(Object.keys(nextErrors).length === 0);
  }, [amount, mode, pkpKeluaranDpp, pkpMasukanDpp]);

  useEffect(() => {
    const timer = setTimeout(hitung, 250);
    return () => clearTimeout(timer);
  }, [hitung]);

  return (
    <>
      <script type="application/ld+json">{schemaData}</script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Kalkulator PPN" />

      <div className="tool-hero-wrapper">
        <ToolHero
          icon="🧾"
          badge="PPN 2025"
          title="Kalkulator PPN"
          subtitle="Hitung PPN 12% untuk harga termasuk/belum termasuk pajak dan simulasi PKP (PPN keluaran vs masukan)."
          tags={['Tarif 12%', 'DPP Otomatis', 'PKP Neto', 'Reset + Copy']}
        />
      </div>

      <ToolLayout
        sidebar={
          <>
            <AdSenseBox size="small" />
            <TipsCard
              title="💡 Tips PPN"
              items={[
                { icon: '📌', text: 'Jika harga sudah include PPN, gunakan mode Termasuk PPN agar DPP dihitung balik.' },
                { icon: '⚖️', text: 'PKP menyetor selisih PPN Keluaran dikurangi PPN Masukan.' },
                { icon: '📅', text: 'Pantau posisi lebih/kurang bayar setiap masa pajak.' },
              ]}
            />
            <RelatedToolsCard
              items={[
                { icon: '🏢', name: 'PPh 25', desc: 'Angsuran PPh badan', href: '/tools/pph-25' },
                { icon: '📋', name: 'PPh 21', desc: 'Pajak penghasilan karyawan', href: '/tools/pph-21' },
                { icon: '📦', name: 'Harga Jual', desc: 'Simulasi harga jual bisnis', href: '/tools/harga-jual' },
              ]}
            />
            <KamusCard
              terms={[
                { term: 'DPP', def: 'Dasar Pengenaan Pajak, nilai sebelum ditambahkan PPN.' },
                { term: 'PPN Keluaran', def: 'PPN yang dipungut dari penjualan barang/jasa kena pajak.' },
                { term: 'PPN Masukan', def: 'PPN yang dibayar saat pembelian dan dapat dikreditkan.' },
              ]}
            />
            <BlogCard
              posts={[
                { title: 'Cara Hitung PPN Masukan dan Keluaran', category: 'Pajak', readTime: '5 menit', slug: 'cara-hitung-ppn-keluaran-masukan' },
                { title: 'Belajar DPP dan Faktur Pajak', category: 'Bisnis', readTime: '4 menit', slug: 'belajar-dpp-faktur-pajak' },
              ]}
            />
          </>
        }
      >
        <div className="calc-card">
          <div className="mode-toggle" style={{ marginBottom: 16 }}>
            <button
              type="button"
              className={`mode-btn${mode === 'belum-termasuk' ? ' active' : ''}`}
              onClick={() => setField('mode', 'belum-termasuk')}
            >
              Harga Belum Termasuk PPN
            </button>
            <button
              type="button"
              className={`mode-btn${mode === 'termasuk' ? ' active' : ''}`}
              onClick={() => setField('mode', 'termasuk')}
            >
              Harga Termasuk PPN
            </button>
          </div>

          <div className="input-grid">
            <div className="input-group">
              <label htmlFor="ppn-amount" className="input-label">
                {mode === 'belum-termasuk' ? 'Harga Sebelum PPN' : 'Harga Termasuk PPN'}
              </label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input
                  id="ppn-amount"
                  type="text"
                  inputMode="numeric"
                  className={`calc-input has-prefix${errors.amount ? ' input-error' : ''}`}
                  value={formatNumber(amount)}
                  onChange={e => {
                    setField('amount', parseNumber(e.target.value));
                    setErrors(prev => ({ ...prev, amount: '' }));
                  }}
                />
              </div>
              {errors.amount && <div className="error-msg">{errors.amount}</div>}
            </div>

            <div className="input-group">
              <label htmlFor="ppn-rate" className="input-label">
                Tarif PPN
              </label>
              <input id="ppn-rate" className="calc-input" value="12% (2025)" readOnly />
            </div>

            <div className="input-group">
              <label htmlFor="ppn-keluaran" className="input-label">
                DPP Keluaran (PKP)
              </label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input
                  id="ppn-keluaran"
                  type="text"
                  inputMode="numeric"
                  className={`calc-input has-prefix${errors.pkpKeluaranDpp ? ' input-error' : ''}`}
                  value={formatNumber(pkpKeluaranDpp)}
                  onChange={e => {
                    setField('pkpKeluaranDpp', parseNumber(e.target.value));
                    setErrors(prev => ({ ...prev, pkpKeluaranDpp: '' }));
                  }}
                />
              </div>
              {errors.pkpKeluaranDpp && <div className="error-msg">{errors.pkpKeluaranDpp}</div>}
            </div>

            <div className="input-group">
              <label htmlFor="ppn-masukan" className="input-label">
                DPP Masukan (PKP)
              </label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input
                  id="ppn-masukan"
                  type="text"
                  inputMode="numeric"
                  className={`calc-input has-prefix${errors.pkpMasukanDpp ? ' input-error' : ''}`}
                  value={formatNumber(pkpMasukanDpp)}
                  onChange={e => {
                    setField('pkpMasukanDpp', parseNumber(e.target.value));
                    setErrors(prev => ({ ...prev, pkpMasukanDpp: '' }));
                  }}
                />
              </div>
              {errors.pkpMasukanDpp && <div className="error-msg">{errors.pkpMasukanDpp}</div>}
            </div>
          </div>

          {show && (
            <div className="result-section show" style={{ marginTop: 28 }}>
              <div className="result-grid">
                <div className="result-card">
                  <div className="result-label">DPP</div>
                  <div className="result-value">{formatRupiah(priceCalc.dpp)}</div>
                  <div className="result-sub">Dasar pengenaan pajak</div>
                </div>
                <div className="result-card">
                  <div className="result-label">PPN 12%</div>
                  <div className="result-value">{formatRupiah(priceCalc.ppn)}</div>
                  <div className="result-sub">Pajak pertambahan nilai</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Total Tagihan</div>
                  <div className="result-value">{formatRupiah(priceCalc.total)}</div>
                  <div className="result-sub">Setelah pajak</div>
                </div>
              </div>

              <div style={{ marginTop: 14, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>PPN Keluaran (12% × DPP keluaran)</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{formatRupiah(pkpCalc.ppnKeluaran)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>PPN Masukan (12% × DPP masukan)</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{formatRupiah(pkpCalc.ppnMasukan)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>Posisi Neto PPN</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: pkpCalc.neto >= 0 ? '#B45309' : '#047857' }}>
                        {pkpCalc.neto >= 0 ? `Kurang bayar ${formatRupiah(pkpCalc.neto)}` : `Lebih bayar ${formatRupiah(Math.abs(pkpCalc.neto))}`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="action-bar" style={{ marginTop: 14 }}>
                <button type="button" className="action-btn copy" onClick={copyResult}>
                  📋 Copy Hasil
                </button>
                <button type="button" className="action-btn share" onClick={shareResult}>
                  🔗 Share
                </button>
                <button type="button" className="action-btn pdf" onClick={exportPDF}>
                  📄 Export PDF
                </button>
                <button
                  type="button"
                  className="action-btn"
                  style={{ background: 'rgba(15,23,42,.06)', color: 'var(--text)' }}
                  onClick={resetInputs}
                >
                  ↺ Reset
                </button>
                <SaveHistoryButton
                  toolId="ppn"
                  toolName="Kalkulator PPN"
                  inputs={{ ...inputs }}
                  result={{ dpp: priceCalc.dpp, ppn: priceCalc.ppn, total: priceCalc.total, neto: pkpCalc.neto }}
                  disabled={!show}
                />
              </div>
              <p className="result-summary" style={{ marginTop: 12 }}>
                {summary}
              </p>
            </div>
          )}
        </div>

        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ — Kalkulator PPN" items={faqItems} />
        </div>
      </ToolLayout>

      <MoreTools exclude="ppn" />
      <FooterSimple />
    </>
  );
}
