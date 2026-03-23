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
  { question: 'Berapa idealnya dana darurat?', answer: 'Panduan umum: single 3 bulan, menikah 6 bulan, menikah + anak 9 bulan pengeluaran rutin. Sesuaikan lagi dengan risiko pribadi dan stabilitas pemasukan.' },
  { question: 'Di mana menyimpan dana darurat?', answer: 'Simpan di instrumen yang likuid dan aman: tabungan bank, deposito berjangka pendek, atau reksa dana pasar uang. Jangan investasikan di saham atau aset berisiko.' },
  { question: 'Apa prioritas: dana darurat atau investasi?', answer: 'Dana darurat HARUS dipenuhi terlebih dahulu sebelum investasi. Dana darurat adalah fondasi keuangan yang melindungi dari risiko tak terduga.' },
  { question: 'Kapan dana darurat boleh dipakai?', answer: 'Hanya untuk keadaan darurat: kehilangan pekerjaan, biaya medis mendesak, perbaikan rumah/kendaraan darurat. Bukan untuk liburan atau pembelian non-esensial.' },
];

const statusOptions = [
  { value: 'single', label: 'Single' },
  { value: 'menikah', label: 'Menikah' },
  { value: 'menikah-anak', label: 'Menikah + Anak' },
];

function getRecommendedMonths(status: string): number {
  if (status === 'single') return 3;
  if (status === 'menikah') return 6;
  return 9;
}

export default function DanaDaruratPage() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_dana_darurat_inputs', {
    pengeluaran: 5000000, status: 'single', tabungan: 10000000, nabungPerBulan: 1000000,
  });
  const { pengeluaran, status, tabungan, nabungPerBulan } = inputs;
  const setField = (k: string, v: number | string) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  useScrollReveal(); useBackToTop();

  const bulanRekom = getRecommendedMonths(status);
  const target = pengeluaran * bulanRekom;
  const gap = Math.max(0, target - tabungan);
  const progress = target > 0 ? Math.min(100, (tabungan / target) * 100) : 0;
  const bulanCapai = nabungPerBulan > 0 && gap > 0 ? Math.ceil(gap / nabungPerBulan) : 0;
  const sudahCukup = tabungan >= target;

  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    const v1 = validateInput(pengeluaran, { min: 500000, required: true, label: 'Pengeluaran' });
    if (v1) e.pengeluaran = v1;
    setErrors(e);
    if (Object.keys(e).length) return;
    setShow(true);
  }, [pengeluaran]);

  useEffect(() => { const t = setTimeout(hitung, 300); return () => clearTimeout(t); }, [hitung]);

  return (
    <>
      <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Kalkulator Dana Darurat — Kalkunesia', description: 'Hitung target dana darurat ideal.', url: 'https://kalkunesia.com/tools/dana-darurat', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' }, provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' } })}</script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Dana Darurat" />
      <div className="tool-hero-wrapper">
        <ToolHero
          icon="🛡️"
          badge="🛡"
          title="Kalkulator Dana Darurat"
          subtitle="Hitung target dana darurat ideal berdasarkan status keluarga. Simulasi berapa bulan untuk mencapai target dengan setoran bulanan."
          tags={['✓ Per Status', '✓ 3/6/9 Bulan', '✓ Simulasi', '✓ Gratis']}
        />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot dana darurat</title>
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
            <text x="45" y="75" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">🛡</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <g className="robot-shield">
              <path d="M62 52c0 8-5 12-9 14-4-2-9-6-9-14V44h18v8Z" fill="#0D9488" stroke="#fff" strokeWidth="1.5" />
              <path d="M53 48l5 5 7-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>
      <ToolLayout sidebar={
        <>
          {/* <AdSenseBox size="rectangle" /> */}
          <TipsCard title="💡 Tips Dana Darurat" items={[{ icon: '🏦', text: 'Simpan di tabungan atau reksa dana pasar uang (likuid & aman)' }, { icon: '⚡', text: 'Prioritaskan dana darurat SEBELUM investasi' }, { icon: '💰', text: 'Gunakan patokan 3/6/9 bulan sesuai status keluarga' }, { icon: '📊', text: 'Review dan sesuaikan target setiap 6 bulan' }]} />
          <RelatedToolsCard items={[{ icon: '📊', name: 'Budget Planner', desc: 'Anggaran 50/30/20', href: '/tools/budget' }, { icon: '💹', name: 'Compound Interest', desc: 'Simulasi tabungan berbunga', href: '/tools/compound' }, { icon: '💰', name: 'Kalkulator Gaji', desc: 'Hitung THP bersih', href: '/tools/gaji' }]} />
          <KamusCard terms={[
            { term: 'Dana Darurat', def: 'Tabungan cadangan untuk keadaan darurat seperti PHK atau biaya medis.' },
            { term: 'Likuid', def: 'Aset yang mudah dicairkan menjadi uang tunai kapan saja.' },
            { term: 'Haul', def: 'Jangka waktu kepemilikan harta minimal satu tahun lunar dalam konteks zakat.' },
            { term: 'Reksa Dana Pasar Uang', def: 'Instrumen investasi likuid dengan return lebih tinggi dari tabungan.' },
            { term: 'Gap', def: 'Selisih antara target dana darurat dengan dana yang sudah tersedia.' },
            { term: 'Autodebet', def: 'Fitur transfer otomatis ke rekening tabungan di tanggal tertentu.' },
          ]} />
          <BlogCard posts={[{ title: 'Urutan Prioritas Keuangan yang Benar', category: 'Perencanaan', readTime: '5 menit', slug: 'prioritas-keuangan' },{ title: 'Dana Darurat: Berapa yang Ideal?', category: 'Perencanaan', readTime: '4 menit', slug: 'dana-darurat-ideal' }]} />
        </>
      }>
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />Kalkulator Dana Darurat</div>
          <div className="input-grid">
            <div className="input-group full"><label htmlFor="pengeluaran-wajib" className="input-label">Pengeluaran Wajib / Bulan</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="pengeluaran-wajib" type="text" inputMode="numeric" className={`calc-input${errors.pengeluaran ? ' input-error' : ''}`} value={formatNumber(pengeluaran)} onChange={e => { setField('pengeluaran', parseNumber(e.target.value)); setErrors({}); }} /></div><input type="range" className="slider" min={1000000} max={50000000} step={500000} value={pengeluaran} onChange={e => setField('pengeluaran', +e.target.value)} /><div className="slider-labels"><span>Rp 1jt</span><span>Rp 50jt</span></div>{errors.pengeluaran && <div className="error-msg">{errors.pengeluaran}</div>}</div>
            <div className="input-group"><label htmlFor="status-keluarga" className="input-label">Status</label><div className="select-wrapper"><select id="status-keluarga" className="calc-select" value={status} onChange={e => setField('status', e.target.value)}>{statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div></div>
            <div className="input-group"><label htmlFor="tabungan-saat-ini" className="input-label">Tabungan Darurat Saat Ini</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="tabungan-saat-ini" type="text" inputMode="numeric" className="calc-input" value={formatNumber(tabungan)} onChange={e => setField('tabungan', parseNumber(e.target.value))} /></div></div>
            <div className="input-group"><label htmlFor="nabung-per-bulan" className="input-label">Rencana Nabung / Bulan</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="nabung-per-bulan" type="text" inputMode="numeric" className="calc-input" value={formatNumber(nabungPerBulan)} onChange={e => setField('nabungPerBulan', parseNumber(e.target.value))} /></div></div>
          </div>
          {show && (<div>
            <div className="result-divider" />
            <div className="result-title-label">Hasil Analisa Dana Darurat</div>
            <div className="result-grid">
              <div className="result-card highlight"><div className="result-label">Target Dana Darurat</div><div className="result-value">{formatRupiah(target)}</div><div className="result-sub">{bulanRekom} bulan × pengeluaran</div></div>
              <div className="result-card"><div className="result-label">Rekomendasi</div><div className="result-value">{bulanRekom} Bulan</div><div className="result-sub">{statusOptions.find(o => o.value === status)?.label}</div></div>
              <div className="result-card"><div className="result-label">Status</div><div className="result-value" style={{ fontSize: 18 }}>{sudahCukup ? '✅ Tercapai' : `⚠️ Kurang ${formatRupiah(gap)}`}</div><div className="result-sub">Progress: {progress.toFixed(1)}%</div></div>
            </div>
            <div className="bracket-badge">Progress: <strong>{progress.toFixed(1)}%</strong> — {sudahCukup ? '✅ Dana darurat sudah cukup!' : `Butuh ${bulanCapai} bulan lagi`}</div>
            {/* Progress Bar */}
            <div style={{ background: 'var(--border)', borderRadius: 8, height: 8, margin: '16px 0', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, progress)}%`, height: '100%', borderRadius: 8, background: progress >= 100 ? 'linear-gradient(90deg, #0D9488, #2DD4BF)' : 'linear-gradient(90deg, #f59e0b, #eab308)', transition: 'width 0.6s ease' }} />
            </div>
            {!sudahCukup && nabungPerBulan > 0 && (
              <div style={{ background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, color: '#92400E' }}>
                💡 Jika menabung {formatRupiah(nabungPerBulan)}/bulan, target tercapai dalam <strong>{bulanCapai} bulan</strong> ({(bulanCapai / 12).toFixed(1)} tahun)
              </div>
            )}
            <table className="result-table"><thead><tr><th>Komponen</th><th>Nilai</th></tr></thead><tbody>
              <tr><td>Pengeluaran / Bulan</td><td className="right">{formatRupiah(pengeluaran)}</td></tr>
              <tr><td>Rekomendasi Bulan</td><td className="right">{bulanRekom} bulan</td></tr>
              <tr><td>Target Dana Darurat</td><td className="right">{formatRupiah(target)}</td></tr>
              <tr><td>Tabungan Saat Ini</td><td className="right">{formatRupiah(tabungan)}</td></tr>
              <tr><td><strong>Kekurangan</strong></td><td className="right"><strong>{formatRupiah(gap)}</strong></td></tr>
            </tbody></table>
            <div className="action-bar">
              <button type="button" className="action-btn copy" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>📋 Copy</button>
              <button type="button" className="action-btn share" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>🔗 Share</button>
              <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
              <SaveHistoryButton toolId="dana-darurat" toolName="Kalkulator Dana Darurat" inputs={{ pengeluaran, status, tabungan }} result={{ target, gap, bulanRekom, progress }} disabled={!show} />
            </div>
            <p className="calc-disclaimer">* Rekomendasi jumlah bulan dana darurat berdasarkan profil umum. Kebutuhan aktual bisa berbeda tergantung tanggungan, kondisi kesehatan, dan stabilitas penghasilan.</p>
          </div>)}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Dana Darurat" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="dana-darurat" /></div>
      <FooterSimple />
    </>
  );
}
