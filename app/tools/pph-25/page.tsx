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
import { formatRupiah, formatNumber, parseNumber, copyResult, shareResult, exportPDF, validateInput, showToast } from '@/lib/utils';
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';

const defaultPph25Inputs = {
  jenis: 'umum',
  labaBersih: 120000000,
  kreditPajak: 30000000,
};

const faqItems = [
  { question: 'Siapa yang wajib bayar PPh 25?', answer: 'Wajib Pajak orang pribadi atau badan dengan pajak terutang berdasarkan laba usaha yang tidak sepenuhnya dipotong pihak lain.' },
  { question: 'Apa bedanya tarif umum dan UMKM 11%?', answer: 'Tarif umum 22% berlaku untuk badan/usaha besar, sementara UMKM dengan omzet tahunan < Rp 50 juta mendapatkan tarif 11% (kalkulasi laba netto).' },
  { question: 'Apa hubungan kredit pajak dengan angsuran?', answer: 'Kredit pajak (misalnya PPh 21/22 atau setoran sebelumnya) mengurangi total pajak setahun sehingga angsuran bulanan jadi lebih ringan.' },
  { question: 'Kapan angsuran harus dibayar?', answer: 'Angsuran PPh 25 dibayar setiap bulan paling lambat tanggal 15 bulan berikutnya.' },
  { question: 'Kenapa perlu jadwal 12 bulan?', answer: 'Jadwal membantu memastikan jumlah angsuran sama sehingga cash flow lebih mudah direncanakan.' },
];

const kamusTerms = [
  { term: 'PPh 25', def: 'Angsuran pajak bulanan berdasarkan pajak terutang tahun sebelumnya.' },
  { term: 'Laba Bersih', def: 'Pendapatan usaha dikurangi seluruh biaya operasional yang diakui.' },
  { term: 'Kredit Pajak', def: 'Pembayaran pajak yang sudah dilakukan atau dipotong pihak lain dan bisa dikurangkan dari pajak terutang.' },
  { term: 'Tarif UMKM', def: '11% untuk WP dengan omzet tahunan di bawah Rp 50 juta menurut kebijakan terbaru.' },
  { term: 'Tarif Umum', def: '22% untuk badan usaha atau pengusaha dengan omzet di atas threshold UMKM.' },
];

export default function Pph25Page() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_pph25_inputs', defaultPph25Inputs);
  const { jenis, labaBersih, kreditPajak } = inputs;
  const setField = (key: string, value: number | string) => setInputs(prev => ({ ...prev, [key]: value }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [schedule, setSchedule] = useState<{ label: string; value: number }[]>([]);
  const [angsuran, setAngsuran] = useState(0);
  const [pajakTahun, setPajakTahun] = useState(0);
  const [resultSummary, setResultSummary] = useState('');
  useScrollReveal();
  useBackToTop();

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kalkulator PPh 25 — Kalkunesia',
    description: 'Hitung angsuran PPh 25 dengan tarif 22% atau 11% UMKM dan jadwal 12 bulan.',
    url: 'https://kalkunesia.com/tools/pph-25',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
    provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
  };

  const resetInputs = () => {
    setInputs(defaultPph25Inputs);
    setErrors({});
    setShow(false);
    setSchedule([]);
    setAngsuran(0);
    setPajakTahun(0);
    setResultSummary('');
  };

  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    const errLaba = validateInput(labaBersih, { min: 0, max: 100000000000, required: true, label: 'Laba bersih tahun sebelumnya' });
    if (errLaba) e.labaBersih = errLaba;
    const errKredit = validateInput(kreditPajak, { min: 0, max: labaBersih, label: 'Kredit pajak' });
    if (errKredit) e.kreditPajak = errKredit;
    setErrors(e);
    if (Object.keys(e).length) {
      setShow(false);
      return;
    }

    const rate = jenis === 'umkm' ? 0.11 : 0.22;
    const pajakBruto = labaBersih * rate;
    const pajakSetahun = Math.max(0, pajakBruto - kreditPajak);
    const angsuranVal = pajakSetahun / 12;
    const scheduleRows = Array.from({ length: 12 }, (_, idx) => ({ label: `Bulan ${idx + 1}`, value: angsuranVal }));

    setSchedule(scheduleRows);
    setAngsuran(angsuranVal);
    setPajakTahun(pajakSetahun);
    setResultSummary(`Angsuran ${formatRupiah(angsuranVal)} dibayar tiap bulan; kredit pajak ${formatRupiah(Math.min(kreditPajak, pajakBruto))} mengurangi total pajak tahunan.`);
    setShow(true);
  }, [jenis, labaBersih, kreditPajak]);

  useEffect(() => {
    const timer = setTimeout(hitung, 300);
    return () => clearTimeout(timer);
  }, [hitung]);

  const rateLabel = jenis === 'umkm' ? '11% UMKM (omzet < Rp 50M)' : '22% Umum';

  return (
    <>
      <Script id="pph25-schema" type="application/ld+json">
        {JSON.stringify(schemaData)}
      </Script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="PPh 25 Calculator" />
      <div className="tool-hero-wrapper">
        <ToolHero icon="🏢" badge="💼 Untuk Usaha" title="Kalkulator PPh 25 / Badan" subtitle="Hitung angsuran PPh Pasal 25 berdasarkan laba tahun sebelumnya plus kredit pajak." tags={['✓ Tarif 2025', '✓ UMKM 11%', '✓ Jadwal 12 Bulan', '✓ Gratis']} />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Ilustrasi robot pajak</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8" />
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53" />
            <circle cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6" />
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448" />
            <rect x="34" y="62" width="22" height="18" rx="4" fill="#0D9488" />
            <text x="45" y="74" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">PPh</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <g>
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
      <ToolLayout sidebar={<>
        <TipsCard title="💡 Tips PPh 25" items={[
          { icon: '📅', text: 'Bayar angsuran bulanan paling lambat tanggal 15 bulan berikutnya.' },
          { icon: '🏪', text: 'UMKM dengan omzet < Rp 50 juta bisa tarif 11%—pilih jenis UMKM.' },
          { icon: '📊', text: 'Gunakan kredit pajak untuk mengurangi jumlah yang harus dibayar.' },
          { icon: '⚠️', text: 'Laporkan angka yang sama di SPT Tahunan agar tidak selisih.' },
        ]} />
        <RelatedToolsCard items={[
          { icon: '📋', name: 'PPh 21 Calculator', desc: 'Pajak karyawan', href: '/tools/pph-21' },
          { icon: '🧾', name: 'Invoice Generator', desc: 'Buat faktur usaha', href: '/tools/invoice' },
          { icon: '📈', name: 'ROI Calculator', desc: 'Ukur profit usaha', href: '/tools/roi' },
        ]} />
        <KamusCard terms={kamusTerms} />
        <BlogCard posts={[
          { title: 'Cara Baca Slip Gaji dengan Benar', category: 'Pajak & Gaji', readTime: '4 menit', slug: 'cara-baca-slip-gaji' },
          { title: 'SPT Tahunan: Panduan Lengkap untuk Karyawan', category: 'Pajak', readTime: '6 menit', slug: 'spt-tahunan-karyawan' },
        ]} />
      </>}> 
        <div className="calc-card">
          <div className="calc-title" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="calc-title-dot" />Kalkulator PPh 25 / Badan
            </div>
            <button type="button" onClick={resetInputs} style={{ borderRadius: 999, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', padding: '8px 14px', fontSize: 13, fontWeight: 600 }}>↺ Reset</button>
          </div>
          <div className="input-grid">
            <div className="input-group full">
              <label htmlFor="pph25-jenis" className="input-label">Jenis Wajib Pajak</label>
              <div className="select-wrapper">
                <select id="pph25-jenis" className="calc-select" value={jenis} onChange={e => setField('jenis', e.target.value)}>
                  <option value="umum">Umum / Badan</option>
                  <option value="umkm">UMKM (omzet &lt; Rp 50 juta/tahun)</option>
                </select>
              </div>
            </div>
            <div className="input-group full">
              <label htmlFor="pph25-laba" className="input-label">Laba Bersih Tahun Sebelumnya</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="pph25-laba" type="text" inputMode="numeric" className={`calc-input has-prefix${errors.labaBersih ? ' input-error' : ''}`} value={formatNumber(labaBersih)} onChange={e => { setField('labaBersih', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, labaBersih: '' })); }} />
              </div>
              <input type="range" className="slider" min={0} max={2000000000} step={1000000} value={labaBersih} onChange={e => setField('labaBersih', parseNumber(e.target.value))} />
              <div className="slider-labels"><span>Rp 0</span><span>Rp 2M</span></div>
              {errors.labaBersih && <div className="error-msg">{errors.labaBersih}</div>}
            </div>
            <div className="input-group full">
              <label htmlFor="pph25-kredit" className="input-label">Kredit Pajak yang Sudah Dibayar</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="pph25-kredit" type="text" inputMode="numeric" className={`calc-input has-prefix${errors.kreditPajak ? ' input-error' : ''}`} value={formatNumber(kreditPajak)} onChange={e => { setField('kreditPajak', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, kreditPajak: '' })); }} />
              </div>
              <input type="range" className="slider" min={0} max={500000000} step={5000000} value={kreditPajak} onChange={e => setField('kreditPajak', parseNumber(e.target.value))} />
              <div className="slider-labels"><span>Rp 0</span><span>Rp 500jt</span></div>
              {errors.kreditPajak && <div className="error-msg">{errors.kreditPajak}</div>}
            </div>
          </div>
          {show && (
            <div>
              <div className="result-divider" />
              <div className="result-title-label">Hasil Perhitungan PPh 25</div>
              <div className="result-grid result-grid-2">
                <div className="result-card highlight">
                  <div className="result-label">Angsuran PPh 25 / Bulan</div>
                  <div className="result-value">{formatRupiah(angsuran)}</div>
                  <div className="result-sub">Dibayar tiap bulan</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Total PPh Setahun</div>
                  <div className="result-value">{formatRupiah(pajakTahun)}</div>
                  <div className="result-sub">Tarif {rateLabel}</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Kredit Pajak</div>
                  <div className="result-value">{formatRupiah(Math.min(kreditPajak, labaBersih * (jenis === 'umkm' ? 0.11 : 0.22)))}</div>
                  <div className="result-sub">Berikutnya dikurangkan dari pajak</div>
                </div>
              </div>
              <div className="bracket-badge">Tarif dasar: <strong>{rateLabel}</strong></div>
              <div style={{ overflowX: 'auto', marginTop: 16 }}>
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>Bulan</th>
                      <th>Angsuran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map(row => (
                      <tr key={row.label}>
                        <td>{row.label}</td>
                        <td className="right">{formatRupiah(row.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="action-bar">
                <button type="button" className="action-btn copy" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>📋 Copy Hasil</button>
                <button type="button" className="action-btn share" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>🔗 Share</button>
                <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
                <SaveHistoryButton toolId="pph-25" toolName="PPh 25 Calculator" inputs={{ jenis, labaBersih, kreditPajak }} result={{ angsuran, pajakTahun }} disabled={!show} />
              </div>
              <p className="result-summary">{resultSummary}</p>
              <p className="calc-disclaimer">* Perhitungan berdasarkan UU HPP No. 7/2021. Sesuaikan dengan SPT Tahunan dan konsultasikan dengan konsultan pajak jika perlu.</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Kalkulator PPh 25 / Badan" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="pph-25" /></div>
      <FooterSimple />
    </>
  );
}
