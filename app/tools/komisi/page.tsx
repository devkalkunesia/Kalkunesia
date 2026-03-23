'use client';
import { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import ToolHero from '@/components/ToolHero';
import ToolLayout from '@/components/ToolLayout';
// import AdSenseBox from '@/components/AdSenseBox';
import FaqSection from '@/components/FaqSection';
import MoreTools from '@/components/MoreTools';
import { TipsCard, RelatedToolsCard, BlogCard, KamusCard } from '@/components/SidebarCards';
import { FooterSimple } from '@/components/Footer';
import SaveHistoryButton from '@/components/SaveHistoryButton';
import { formatRupiah, formatNumber, parseNumber, showToast, copyResult, shareResult, exportPDF, validateInput } from '@/lib/utils'
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';

const faqItems = [
  { question: 'Apa perbedaan komisi flat dan tiered?', answer: 'Komisi flat: persentase tetap dari semua penjualan. Komisi tiered: persentase berbeda tergantung pencapaian target (semakin tinggi achievement, semakin tinggi rate).' },
  { question: 'Berapa rata-rata komisi sales?', answer: 'Bervariasi per industri: properti 1-3%, asuransi 10-30%, retail 2-5%, B2B software 5-15%. Negosiasikan saat proses rekrutmen.' },
  { question: 'Apa itu achievement rate?', answer: 'Persentase pencapaian target: realisasi ÷ target × 100%. Achievement 100% berarti target tercapai penuh.' },
  { question: 'Tips mencapai target sales?', answer: 'Buat pipeline prospek 3× target, follow up konsisten, fokus pada high-value deals, dan track conversion rate per tahap.' },
];

type KomisiMode = 'flat' | 'tiered';

export default function KomisiPage() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_komisi_inputs', {
    gajiPokok: 5000000, target: 100000000, realisasi: 85000000,
    mode: 'tiered' as KomisiMode, flatRate: 2,
    tier1Rate: 1, tier2Rate: 2, tier3Rate: 3,
  });
  const { gajiPokok, target, realisasi, mode, flatRate, tier1Rate, tier2Rate, tier3Rate } = inputs;
  const setField = (k: string, v: number | string) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  useScrollReveal(); useBackToTop();

  const achievement = target > 0 ? (realisasi / target) * 100 : 0;

  let komisi = 0;
  if (mode === 'flat') {
    komisi = realisasi * flatRate / 100;
  } else {
    const batas80 = target * 0.8;
    const batas100 = target;
    if (realisasi <= batas80) {
      komisi = realisasi * tier1Rate / 100;
    } else if (realisasi <= batas100) {
      komisi = batas80 * tier1Rate / 100 + (realisasi - batas80) * tier2Rate / 100;
    } else {
      komisi = batas80 * tier1Rate / 100 + (batas100 - batas80) * tier2Rate / 100 + (realisasi - batas100) * tier3Rate / 100;
    }
  }
  const totalPenghasilan = gajiPokok + komisi;

  // Next tier info
  let nextTierInfo = '';
  if (mode === 'tiered') {
    const batas80 = target * 0.8;
    const batas100 = target;
    if (realisasi < batas80) nextTierInfo = `Butuh ${formatRupiah(batas80 - realisasi)} lagi untuk naik ke tier 2 (${tier2Rate}%)`;
    else if (realisasi < batas100) nextTierInfo = `Butuh ${formatRupiah(batas100 - realisasi)} lagi untuk naik ke tier 3 (${tier3Rate}%)`;
    else nextTierInfo = `🎉 Sudah di tier tertinggi! Achievement ${achievement.toFixed(1)}%`;
  }

  const hitung = useCallback(() => {
    void [gajiPokok, realisasi, mode, flatRate, tier1Rate, tier2Rate, tier3Rate];
    const e: Record<string, string> = {};
    const v1 = validateInput(target, { min: 1000000, required: true, label: 'Target' });
    if (v1) e.target = v1;
    setErrors(e);
    if (Object.keys(e).length) return;
    setShow(true);
  }, [gajiPokok, target, realisasi, mode, flatRate, tier1Rate, tier2Rate, tier3Rate]);

  useEffect(() => { const t = setTimeout(hitung, 300); return () => clearTimeout(t); }, [hitung]);

  return (
    <>
      <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Kalkulator Komisi Sales — Kalkunesia', description: 'Hitung komisi sales flat dan tiered.', url: 'https://kalkunesia.com/tools/komisi', applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' }, provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' } })}</script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Komisi Sales" />
      <div className="tool-hero-wrapper">
        <ToolHero
          icon="🏆"
          badge="% KOMISI"
          title="Kalkulator Komisi Sales"
          subtitle="Hitung komisi penjualan flat atau tiered, pantau achievement rate, dan lihat THP dalam satu menit."
          tags={['Flat Rate', 'Tiered Bonus', 'Achievement', 'THP']}
        />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot komisi</title>
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
            <text x="45" y="75" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">%</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <g className="robot-trophy">
              <path d="M72 44h16v8c0 6-3.5 10-8 10s-8-4-8-10v-8z" fill="#fde68a" stroke="#0D9488" strokeWidth="1.5" />
              <path d="M76 62h8v4h-8z" fill="#0D9488" />
              <path d="M74 66h12v3h-12z" fill="#14b8a6" />
            </g>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>
      <ToolLayout
        sidebar={
          <>
            {/* <AdSenseBox size="rectangle" /> */}
            <TipsCard title="💡 Tips Komisi" items={[
              { icon: '🎯', text: 'Tetapkan target realistis lalu atur pipeline yang mendukung achievement.' },
              { icon: '📈', text: 'Lihat tier tertinggi dulu: kenaikan rate terlihat saat realisasi tembus 100%.' },
              { icon: '🤝', text: 'Komunikasikan struktur komisi dengan tim HR dan atasan.' },
              { icon: '🧭', text: 'Gunakan kalkulator ini untuk menilai penawaran base + bonus.' },
            ]} />
            <RelatedToolsCard items={[
              { icon: '📊', name: 'Kalkulator BEP', desc: 'Titik impas usaha', href: '/tools/bep' },
              { icon: '💰', name: 'Kalkulator Gaji', desc: 'THP setelah pajak', href: '/tools/gaji' },
              { icon: '📋', name: 'PPh 21', desc: 'Pajak penghasilan', href: '/tools/pph-21' },
            ]} />
            <KamusCard terms={[
              { term: 'Komisi', def: 'Pendapatan tambahan berdasarkan persentase dari nilai penjualan.' },
              { term: 'Target', def: 'Nilai penjualan yang harus dicapai dalam periode tertentu.' },
              { term: 'Achievement', def: 'Persentase realisasi penjualan terhadap target (realisasi/target×100%).' },
              { term: 'Tiered Commission', def: 'Sistem komisi berjenjang di mana rate naik sesuai pencapaian.' },
              { term: 'Pipeline', def: 'Daftar prospek dan peluang penjualan yang sedang dalam proses.' },
              { term: 'Take Home Pay', def: 'Total penghasilan bersih setelah gaji pokok ditambah komisi.' },
            ]} />
            <BlogCard posts={[
              { title: 'Struktur Komisi Tiered yang Adil', category: 'Sales', readTime: '4 menit', slug: 'struktur-komisi-tiered' },
              { title: 'Cara Meningkatkan Achievement Rate Sales', category: 'Bisnis', readTime: '5 menit', slug: 'meningkatkan-achievement-rate-sales' },
            ]} />
          </>
        }
      >
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />Kalkulator Komisi Sales</div>
          <div className="input-grid">
            <div className="input-group"><label htmlFor="gaji-pokok" className="input-label">Gaji Pokok / Bulan</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="gaji-pokok" type="text" inputMode="numeric" className="calc-input" value={formatNumber(gajiPokok)} onChange={e => setField('gajiPokok', parseNumber(e.target.value))} /></div></div>
            <div className="input-group"><label htmlFor="target-penjualan" className="input-label">Target Penjualan / Bulan</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="target-penjualan" type="text" inputMode="numeric" className={`calc-input${errors.target ? ' input-error' : ''}`} value={formatNumber(target)} onChange={e => { setField('target', parseNumber(e.target.value)); setErrors({}); }} /></div>{errors.target && <div className="error-msg">{errors.target}</div>}</div>
            <div className="input-group full"><label htmlFor="realisasi-penjualan" className="input-label">Realisasi Penjualan</label><div className="input-wrap"><span className="input-prefix">Rp</span><input id="realisasi-penjualan" type="text" inputMode="numeric" className="calc-input" value={formatNumber(realisasi)} onChange={e => setField('realisasi', parseNumber(e.target.value))} /></div></div>
          </div>
          {/* Mode */}
          <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
            <button type="button" className={`mode-btn${mode === 'flat' ? ' active' : ''}`} style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700 }} onClick={() => setField('mode', 'flat')}>📊 Flat Rate</button>
            <button type="button" className={`mode-btn${mode === 'tiered' ? ' active' : ''}`} style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700 }} onClick={() => setField('mode', 'tiered')}>📈 Tiered</button>
          </div>
          {mode === 'flat' ? (
            <div className="input-grid"><div className="input-group"><label htmlFor="flat-rate" className="input-label">Rate Komisi</label><div className="input-wrap"><input id="flat-rate" type="text" inputMode="numeric" className="calc-input" value={formatNumber(flatRate)} onChange={e => setField('flatRate', parseNumber(e.target.value))} step={0.1} /><span className="input-suffix">%</span></div></div></div>
          ) : (
            <div className="input-grid">
              <div className="input-group"><label htmlFor="tier1-rate" className="input-label">0-80% target</label><div className="input-wrap"><input id="tier1-rate" type="text" inputMode="numeric" className="calc-input" value={formatNumber(tier1Rate)} onChange={e => setField('tier1Rate', parseNumber(e.target.value))} step={0.1} /><span className="input-suffix">%</span></div></div>
              <div className="input-group"><label htmlFor="tier2-rate" className="input-label">80-100% target</label><div className="input-wrap"><input id="tier2-rate" type="text" inputMode="numeric" className="calc-input" value={formatNumber(tier2Rate)} onChange={e => setField('tier2Rate', parseNumber(e.target.value))} step={0.1} /><span className="input-suffix">%</span></div></div>
              <div className="input-group"><label htmlFor="tier3-rate" className="input-label">&gt;100% target</label><div className="input-wrap"><input id="tier3-rate" type="text" inputMode="numeric" className="calc-input" value={formatNumber(tier3Rate)} onChange={e => setField('tier3Rate', parseNumber(e.target.value))} step={0.1} /><span className="input-suffix">%</span></div></div>
            </div>
          )}
          {show && (<div>
            <div className="result-divider" />
            <div className="result-title-label">Hasil Kalkulasi Komisi</div>
            <div className="result-grid">
              <div className="result-card highlight"><div className="result-label">Total Penghasilan</div><div className="result-value">{formatRupiah(totalPenghasilan)}</div><div className="result-sub">Gaji + komisi</div></div>
              <div className="result-card"><div className="result-label">Komisi</div><div className="result-value">{formatRupiah(komisi)}</div><div className="result-sub">{mode === 'flat' ? `Flat ${flatRate}%` : 'Tiered'}</div></div>
              <div className="result-card"><div className="result-label">Achievement</div><div className="result-value" style={{ color: achievement >= 100 ? '#2DD4BF' : achievement >= 80 ? '#eab308' : '#ef4444' }}>{achievement.toFixed(1)}%</div><div className="result-sub">{formatRupiah(realisasi)} / {formatRupiah(target)}</div></div>
            </div>
            <div className="bracket-badge">Achievement: <strong>{achievement.toFixed(1)}%</strong> dari target — Total THP: <strong>{formatRupiah(totalPenghasilan)}</strong></div>
            {/* Achievement bar */}
            <div style={{ background: 'var(--border)', borderRadius: 8, height: 8, margin: '16px 0', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, achievement)}%`, height: '100%', borderRadius: 8, background: achievement >= 100 ? 'linear-gradient(90deg, #0D9488, #2DD4BF)' : achievement >= 80 ? 'linear-gradient(90deg, #eab308, #f59e0b)' : 'linear-gradient(90deg, #ef4444, #f87171)', transition: 'width 0.6s ease' }} />
            </div>
            {nextTierInfo && <div style={{ background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, color: '#92400E' }}>💡 {nextTierInfo}</div>}
            <table className="result-table"><thead><tr><th>Komponen</th><th>Nilai</th></tr></thead><tbody>
              <tr><td>Gaji Pokok</td><td className="right">{formatRupiah(gajiPokok)}</td></tr>
              <tr><td>Realisasi Penjualan</td><td className="right">{formatRupiah(realisasi)}</td></tr>
              <tr><td>Achievement Rate</td><td className="right">{achievement.toFixed(1)}%</td></tr>
              <tr><td>Komisi ({mode})</td><td className="right">{formatRupiah(komisi)}</td></tr>
              <tr><td><strong>Total Penghasilan</strong></td><td className="right"><strong>{formatRupiah(totalPenghasilan)}</strong></td></tr>
            </tbody></table>
            <div className="action-bar">
              <button type="button" className="action-btn copy" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>📋 Copy</button>
              <button type="button" className="action-btn share" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>🔗 Share</button>
              <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
              <SaveHistoryButton toolId="komisi" toolName="Komisi Sales" inputs={{ gajiPokok, target, realisasi, mode }} result={{ komisi, totalPenghasilan, achievement }} disabled={!show} />
            </div>
            <p className="calc-disclaimer">* Perhitungan komisi berdasarkan skema yang diinput. Komisi aktual tergantung kebijakan perusahaan, struktur KPI, dan ketentuan kontrak kerja.</p>
          </div>)}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Komisi Sales" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="komisi" /></div>
      <FooterSimple />
    </>
  );
}
