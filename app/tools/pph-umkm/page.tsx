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
import { formatRupiah, showToast, copyResult, shareResult, exportPDF, validateInput, formatNumber, parseNumber } from '@/lib/utils';
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';

const faqItems = [
  { question: 'Berapa tarif PPh Final UMKM?', answer: 'Tarif PPh Final UMKM adalah 0.5% dari omzet bruto per bulan, sesuai PP 55/2022. Ini berlaku untuk WP Orang Pribadi dengan omzet ≤ Rp 4,8M per tahun.' },
  { question: 'Apakah ada batas omzet bebas pajak untuk UMKM?', answer: 'Ya, WP Orang Pribadi UMKM dengan omzet ≤ Rp 500 juta per tahun tidak dikenakan PPh Final. Fasilitas ini berlaku sejak UU HPP.' },
  { question: 'Kapan UMKM wajib menjadi PKP?', answer: 'UMKM wajib mendaftar sebagai PKP jika omzet per tahun melebihi Rp 4,8 miliar. Setelah menjadi PKP, wajib memungut dan melaporkan PPN.' },
  { question: 'Bagaimana cara menyetor PPh Final UMKM?', answer: 'Setor PPh Final UMKM paling lambat tanggal 15 bulan berikutnya melalui e-Billing DJP Online (kode MAP 411128, kode jenis setoran 420).' },
];

export default function PPhUMKMPage() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_pph_umkm_inputs', {
    omzet: 50000000, jenisUsaha: 'dagang', isPKP: false,
  });
  const { omzet, jenisUsaha, isPKP } = inputs;
  const setField = (k: string, v: number | string | boolean) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  useScrollReveal(); useBackToTop();

  const omzetTahun = omzet * 12;
  const batasBebas = 500000000;
  const batasPKP = 4800000000;
  const pphBulan = omzetTahun <= batasBebas ? 0 : omzet * 0.005;
  const pphTahun = pphBulan * 12;
  const wajibPKP = omzetTahun > batasPKP;
  const bebasPajak = omzetTahun <= batasBebas;
  const cicilanBulanan = Array.from({ length: 12 }, (_, idx) => ({
    bulan: idx + 1,
    omzet,
    pph: pphBulan,
  }));

  const resetForm = () => {
    setInputs({ omzet: 50000000, jenisUsaha: 'dagang', isPKP: false });
    setErrors({});
    setShow(false);
  };

  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    const v1 = validateInput(omzet, { min: 100000, required: true, label: 'Omzet' });
    if (v1) e.omzet = v1;
    setErrors(e);
    if (Object.keys(e).length) return;
    setShow(true);
  }, [omzet]);

  useEffect(() => { const t = setTimeout(hitung, 300); return () => clearTimeout(t); }, [hitung]);

  return (
    <>
      <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Kalkulator PPh Final UMKM — Kalkunesia', description: 'Hitung pajak UMKM 0.5% dari omzet.', url: 'https://kalkunesia.com/tools/pph-umkm', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' }, provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' } })}</script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="PPh Final UMKM" />
      <div className="tool-hero-wrapper">
        <ToolHero icon="🏪" badge="UMKM" title="PPh Final UMKM" subtitle="Hitung pajak penghasilan final UMKM 0.5% sesuai PP 55/2022. Cek kewajiban PKP dan estimasi pajak." tags={['✓ PP 55/2022', '✓ Batas Bebas Pajak', '✓ Cek PKP', '✓ Gratis']} />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot PPh Final UMKM</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8" />
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53" />
            <circle cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle cx="35" cy="33" r="2.5" fill="#fff" />
            <circle cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle cx="55" cy="33" r="2.5" fill="#fff" />
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6" />
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448" />
            <rect x="38" y="62" width="14" height="18" rx="4" fill="#0D9488" opacity="0.8" />
            <text x="45" y="75" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">0.5%</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <line x1="74" y1="58" x2="64" y2="44" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <rect x="56" y="34" width="24" height="16" rx="4" fill="#fff" stroke="#0D9488" strokeWidth="1.5" />
            <text x="68" y="45" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0D9488">UMKM</text>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>
      <ToolLayout sidebar={<>
        {/* <AdSenseBox size="rectangle" /> */}
        <TipsCard title="💡 Tips Pajak UMKM" items={[{ icon: '📋', text: 'Omzet ≤ Rp 500jt/tahun untuk WP OP — bebas PPh Final' }, { icon: '🏦', text: 'Setor PPh Final paling lambat tanggal 15 bulan berikutnya' }, { icon: '💰', text: 'Catat semua transaksi untuk lapor SPT Tahunan' }, { icon: '📊', text: 'Omzet > Rp 4,8M/tahun wajib daftar PKP' }]} />
        <RelatedToolsCard items={[{ icon: '🧾', name: 'Kalkulator PPN', desc: 'Hitung PPN 12% (2025)', href: '/tools/ppn' }, { icon: '📋', name: 'PPh 21 Calculator', desc: 'Pajak penghasilan karyawan', href: '/tools/pph-21' }, { icon: '🧾', name: 'Invoice Generator', desc: 'Buat invoice PDF', href: '/tools/invoice' }]} />
        <KamusCard terms={[
          { term: 'PPh Final', def: 'Pajak penghasilan yang bersifat final, tidak digabung dengan penghasilan lain.' },
          { term: 'UMKM', def: 'Usaha Mikro Kecil Menengah dengan omzet ≤ Rp 4,8M/tahun.' },
          { term: 'Omzet', def: 'Total penerimaan bruto usaha sebelum dikurangi biaya apapun.' },
          { term: 'PKP', def: 'Pengusaha Kena Pajak, wajib daftar jika omzet > Rp 4,8M/tahun.' },
          { term: 'e-Billing', def: 'Sistem pembayaran pajak online DJP untuk setor PPh Final UMKM.' },
          { term: 'SPT', def: 'Surat Pemberitahuan Tahunan, laporan pajak yang wajib disampaikan ke DJP.' },
        ]} />
        <BlogCard posts={[{ title: 'Cara Baca Slip Gaji dengan Benar', category: 'Pajak & Gaji', readTime: '4 menit', slug: 'cara-baca-slip-gaji' },{ title: 'SPT Tahunan: Panduan Lengkap untuk Karyawan', category: 'Pajak', readTime: '6 menit', slug: 'spt-tahunan-karyawan' }]} />
      </>}>
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />PPh Final UMKM</div>
          <div className="input-grid">
            <div className="input-group full"><label htmlFor="umkm-omzet" className="input-label">Omzet per Bulan</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="umkm-omzet" type="text" inputMode="numeric" className={`calc-input${errors.omzet ? ' input-error' : ''}`} value={formatNumber(omzet)} onChange={e => { setField('omzet', parseNumber(e.target.value)); setErrors(prev => ({ ...prev, omzet: '' })); }} /></div><input type="range" className="slider" min={1000000} max={500000000} step={1000000} value={omzet} onChange={e => setField('omzet', +e.target.value)} /><div className="slider-labels"><span>Rp 1jt</span><span>Rp 500jt</span></div>{errors.omzet && <div className="error-msg">{errors.omzet}</div>}</div>
            <div className="input-group"><label htmlFor="umkm-jenis" className="input-label">Jenis Usaha</label><div className="select-wrapper"><select id="umkm-jenis" className="calc-select" value={jenisUsaha} onChange={e => setField('jenisUsaha', e.target.value)}><option value="dagang">Dagang</option><option value="jasa">Jasa</option><option value="industri">Industri</option></select></div></div>
            <div className="input-group"><label htmlFor="umkm-status" className="input-label">Status PKP</label><div id="umkm-status" className="mode-toggle"><button type="button" className={`mode-btn${!isPKP ? ' active' : ''}`} onClick={() => setField('isPKP', false)}>Non-PKP</button><button type="button" className={`mode-btn${isPKP ? ' active' : ''}`} onClick={() => setField('isPKP', true)}>PKP</button></div></div>
          </div>
          {show && (<div>
            <div className="result-divider" />
            <div className="result-title-label">Hasil Perhitungan PPh Final UMKM</div>
            {wajibPKP && <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, color: '#ef4444' }}>⚠️ Omzet tahunan {formatRupiah(omzetTahun)} melebihi Rp 4,8M — Wajib mendaftar sebagai PKP!</div>}
            {bebasPajak && <div style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, color: '#065f46' }}>✅ Omzet tahunan {formatRupiah(omzetTahun)} ≤ Rp 500jt — Bebas PPh Final (WP Orang Pribadi)</div>}
            <div className="result-grid result-grid-2">
              <div className="result-card highlight"><div className="result-label">PPh Final / Bulan</div><div className="result-value">{formatRupiah(pphBulan)}</div><div className="result-sub">0.5% × omzet</div></div>
              <div className="result-card"><div className="result-label">PPh Final / Tahun</div><div className="result-value">{formatRupiah(pphTahun)}</div><div className="result-sub">Estimasi 12 bulan</div></div>
            </div>
            <div className="bracket-badge">{bebasPajak ? 'Bebas PPh Final' : `Tarif Efektif: 0.5% dari omzet bulanan`}{wajibPKP ? ' — ⚠️ Wajib PKP' : ''}</div>
            <table className="result-table"><thead><tr><th>Komponen</th><th>Nilai</th></tr></thead><tbody>
              <tr><td>Omzet per Bulan</td><td className="right">{formatRupiah(omzet)}</td></tr>
              <tr><td>Omzet per Tahun</td><td className="right">{formatRupiah(omzetTahun)}</td></tr>
              <tr><td>Tarif PPh Final</td><td className="right">0.5%</td></tr>
              <tr><td>Jenis Usaha</td><td className="right">{jenisUsaha.charAt(0).toUpperCase() + jenisUsaha.slice(1)}</td></tr>
              <tr><td>Status PKP</td><td className="right">{isPKP ? 'PKP' : 'Non-PKP'}</td></tr>
              <tr><td><strong>PPh Final / Bulan</strong></td><td className="right"><strong>{formatRupiah(pphBulan)}</strong></td></tr>
            </tbody></table>

            <div style={{ marginTop: 12, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(15,23,42,.04)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>Bulan</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px' }}>Omzet</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px' }}>PPh 0.5%</th>
                  </tr>
                </thead>
                <tbody>
                  {cicilanBulanan.map(item => (
                    <tr key={item.bulan}>
                      <td style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>Bulan {item.bulan}</td>
                      <td style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>{formatRupiah(item.omzet)}</td>
                      <td style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>{formatRupiah(item.pph)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="action-bar">
              <button type="button" className="action-btn copy" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>📋 Copy</button>
              <button type="button" className="action-btn share" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>🔗 Share</button>
              <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
              <button type="button" className="action-btn reset" onClick={resetForm}>↺ Reset</button>
              <SaveHistoryButton toolId="pph-umkm" toolName="PPh Final UMKM" inputs={{ omzet, jenisUsaha, isPKP }} result={{ pphBulan, pphTahun, omzetTahun }} disabled={!show} />
            </div>
            <p className="result-summary" style={{ marginTop: 12 }}>
              {bebasPajak
                ? 'Omzet tahunan masih di bawah ambang bebas pajak Rp 500 juta, sehingga PPh Final tidak terutang.'
                : `Estimasi angsuran PPh Final UMKM ${formatRupiah(pphBulan)} per bulan atau ${formatRupiah(pphTahun)} per tahun.`}
              {wajibPKP ? ' Omzet juga sudah melewati ambang PKP, sehingga perlu transisi ke skema pajak umum dan kewajiban PPN.' : ''}
            </p>
            <p className="calc-disclaimer">* Tarif PPh Final 0.5% berdasarkan PP No. 55/2022. Bebas pajak untuk WP OP dengan omzet ≤ Rp 500jt/tahun sesuai UU HPP No. 7/2021.</p>
          </div>)}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ PPh Final UMKM" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="pph-umkm" /></div>
      <FooterSimple />
    </>
  );
}
