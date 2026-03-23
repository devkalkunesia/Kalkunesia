'use client';
import { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import ToolHero from '@/components/ToolHero';
import ToolLayout from '@/components/ToolLayout';
import Script from 'next/script';
import FaqSection from '@/components/FaqSection';
import MoreTools from '@/components/MoreTools';
import { TipsCard, RelatedToolsCard, BlogCard, KamusCard } from '@/components/SidebarCards';
import { FooterSimple } from '@/components/Footer';
import { formatRupiah, formatNumber, parseNumber, copyResult, shareResult, exportPDF, validateInput, showToast } from '@/lib/utils';
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';
import SaveHistoryButton from '@/components/SaveHistoryButton';

const faqItems = [
  { question: 'Apakah metode 50/30/20 cocok untuk semua orang?', answer: 'Metode ini adalah panduan, bukan aturan kaku. Jika biaya hidup di kota besar membuat kebutuhan melebihi 50%, sesuaikan menjadi 60/20/20 atau 70/10/20. Yang penting, pastikan tabungan tidak di bawah 10%.' },
  { question: 'Bagaimana jika gaji saya kecil?', answer: 'Prioritaskan dana darurat dulu (minimal 1x pengeluaran bulanan), lalu sisihkan minimal 10% untuk tabungan meski kecil. Konsistensi lebih penting dari jumlah di awal.' },
  { question: 'Apa yang termasuk kebutuhan vs keinginan?', answer: 'Kebutuhan: sewa, makan pokok, transportasi kerja, tagihan listrik/air. Keinginan: Netflix, makan di restoran, baju baru, gadget. Pertanyaan kuncinya: apakah hidup kamu terganggu jika tidak ada ini?' },
  { question: 'Berapa idealnya dana darurat?', answer: 'Idealnya 3-6x total pengeluaran bulanan. Jika pengeluaran Rp 5jt/bulan, target dana darurat Rp 15-30jt. Simpan di tabungan atau reksa dana pasar uang yang mudah dicairkan.' },
];

const defaultBudgetInputs = {
  thp: 8000000,
  sewa: 2000000,
  makan: 1500000,
  transport: 500000,
  tagihan: 300000,
  dineout: 500000,
  hiburan: 200000,
  shopping: 300000,
  lainnya: 0,
  tabungan: 800000,
  darurat: 200000,
  investasi: 500000,
};

type BudgetCategoryKey = 'needs' | 'wants' | 'savings' | 'invest';
type BudgetInputs = typeof defaultBudgetInputs;
type BudgetMethod = 'classic' | 'balanced';

type BudgetCategory = {
  id: BudgetCategoryKey;
  label: string;
  percent: number;
  description: string;
  goal: 'cap' | 'target';
};

const budgetMethods: Record<BudgetMethod, { badge: string; title: string; summary: string; categories: BudgetCategory[] }> = {
  classic: {
    badge: '50/30/20',
    title: 'Budget Planner 50/30/20',
    summary: 'Penekanan kebutuhan, keinginan, dan tabungan agar dana tetap sehat tiap bulan.',
    categories: [
      { id: 'needs', label: 'Kebutuhan', percent: 50, description: 'Sewa, makan, transport, tagihan utama.', goal: 'cap' },
      { id: 'wants', label: 'Keinginan', percent: 30, description: 'Hiburan, makan di luar, shopping ringan.', goal: 'cap' },
      { id: 'savings', label: 'Tabungan & Darurat', percent: 20, description: 'Tabungan bulanan dan dana darurat.', goal: 'target' },
    ],
  },
  balanced: {
    badge: '40/30/20/10',
    title: 'Budget Planner 40/30/20/10',
    summary: 'Tambahan kategori investasi/amal 10% untuk perencanaan lebih robust.',
    categories: [
      { id: 'needs', label: 'Kebutuhan', percent: 40, description: 'Sewa, makan, transport, tagihan utama.', goal: 'cap' },
      { id: 'wants', label: 'Keinginan', percent: 30, description: 'Hiburan, gaya hidup, rekreasi.', goal: 'cap' },
      { id: 'savings', label: 'Tabungan & Darurat', percent: 20, description: 'Tabungan rutin dan cadangan darurat.', goal: 'target' },
      { id: 'invest', label: 'Investasi & Amal', percent: 10, description: 'Investasi, pelunasan utang, atau sedekah rutin.', goal: 'target' },
    ],
  },
};

export default function BudgetPage() {
  const [inputs, setInputs] = useLocalStorage<BudgetInputs>('kalkunesia_budget_inputs', defaultBudgetInputs);
  const [method, setMethod] = useLocalStorage<BudgetMethod>('kalkunesia_budget_method', 'classic');
  const { thp, sewa, makan, transport, tagihan, dineout, hiburan, shopping, lainnya, tabungan, darurat, investasi } = inputs;
  const setField = <K extends keyof BudgetInputs>(key: K, value: number) => setInputs(prev => ({ ...prev, [key]: value }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(true);
  useScrollReveal();
  useBackToTop();

  const kebutuhan = sewa + makan + transport + tagihan;
  const keinginan = dineout + hiburan + shopping + lainnya;
  const saving = tabungan + darurat;
  const total = kebutuhan + keinginan + saving + investasi;
  const sisa = thp - total;
  const methodConfig = budgetMethods[method];
  const actualBreakdown: Record<BudgetCategoryKey, number> = {
    needs: kebutuhan,
    wants: keinginan,
    savings: saving,
    invest: investasi,
  };
  const needsConfig = methodConfig.categories.find(cat => cat.id === 'needs');
  const wantsConfig = methodConfig.categories.find(cat => cat.id === 'wants');
  const savingsConfig = methodConfig.categories.find(cat => cat.id === 'savings');
  const investConfig = methodConfig.categories.find(cat => cat.id === 'invest');
  const categoryAnalysis = methodConfig.categories.map(cat => {
    const target = (thp * cat.percent) / 100;
    const actual = actualBreakdown[cat.id] || 0;
    const actualPct = thp > 0 ? (actual / thp) * 100 : 0;
    const meetsTarget = cat.goal === 'cap' ? actual <= target : actual >= target;
    const diff = actual - target;
    const statusLabel = meetsTarget ? '✅ Sesuai' : cat.goal === 'cap' ? '⚠️ Melebihi' : '⚠️ Kurang';
    const statusDetail = meetsTarget
      ? cat.goal === 'target'
        ? 'Target tercapai'
        : ''
      : `${cat.goal === 'cap' ? 'Melebihi' : 'Kurang'} ${formatRupiah(Math.abs(diff))}`;
    return { cat, target, actual, actualPct, statusLabel, statusDetail };
  });
  const meetsTargets = methodConfig.categories.every(cat => {
    const target = (thp * cat.percent) / 100;
    const actual = actualBreakdown[cat.id] || 0;
    return cat.goal === 'cap' ? actual <= target : actual >= target;
  });
  const skor = sisa >= 0 && meetsTargets ? '🟢 Baik' : sisa >= 0 ? '🟡 Perlu Perbaikan' : '🔴 Over Budget';
  const saran = sisa < 0
    ? '⚠️ Budget kamu melebihi penghasilan! Kurangi pengeluaran keinginan terlebih dahulu.'
    : meetsTargets
      ? '✅ Budget kamu sudah cukup sehat. Pertahankan momentum dan tambah alokasi investasi secara bertahap.'
      : '💡 Beberapa kategori masih perlu disesuaikan agar anggaran tetap seimbang setiap bulan.';
  const monthlyStatusLabel = sisa >= 0 ? 'Surplus Bulanan' : 'Defisit Bulanan';
  const monthlyStatusDetail = sisa >= 0
    ? `Kamu punya ${formatRupiah(sisa)} ekstra untuk investasi, cicilan, atau tabungan tujuan.`
    : `Pengeluaran kamu melebihi penghasilan ${formatRupiah(Math.abs(sisa))}. Tinjau kembali kategori prioritas.`;

  const hitung = useCallback(() => {
    const sanity = sewa + makan + transport + tagihan + dineout + hiburan + shopping + lainnya + tabungan + darurat + investasi;
    if (!Number.isFinite(sanity)) {
      setShow(false);
      return;
    }
    const nextErrors: Record<string, string> = {};
    const v1 = validateInput(thp, { min: 1, required: true, label: 'Penghasilan' });
    if (v1) nextErrors.thp = v1;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setShow(false);
      return;
    }
    setShow(true);
  }, [thp, sewa, makan, transport, tagihan, dineout, hiburan, shopping, lainnya, tabungan, darurat, investasi]);

  const resetBudget = () => {
    setInputs(defaultBudgetInputs);
    setMethod('classic');
    setErrors({});
    setShow(false);
  };

  useEffect(() => {
    const timer = setTimeout(hitung, 300);
    return () => clearTimeout(timer);
  }, [hitung]);

  const inp = (label: string, val: number, key: keyof BudgetInputs) => {
    const fieldId = `${key}-input`;
    return (
      <div className="input-group">
        <label htmlFor={fieldId} className="input-label">{label}</label>
        <div className="input-wrap">
          <span className="input-prefix">Rp</span>
          <input
            id={fieldId}
            type="text"
            inputMode="numeric"
            className="calc-input has-prefix"
            value={formatNumber(val)}
            onChange={e => setField(key, parseNumber(e.target.value))}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <Script id="budget-schema" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Budget Planner — Kalkunesia',
          description: 'Rencanakan anggaran bulanan dengan metode 50/30/20.',
          url: 'https://kalkunesia.com/tools/budget',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web Browser',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
          provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
        })}
      </Script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Budget Planner" />
      <div className="tool-hero-wrapper">
        <ToolHero
          icon="📊"
          badge={methodConfig.badge}
          title={methodConfig.title}
          subtitle={methodConfig.summary}
          tags={[`${methodConfig.badge}`, 'Analisis Sisa', 'Kebutuhan vs Keinginan', 'Saran Anggaran']}
        />
        <div
          style={{
            position: 'absolute',
            right: 160,
            top: '45%',
            transform: 'translateY(-50%)',
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'conic-gradient(#0D9488 0 50%, #6366F1 50% 80%, #F97316 80% 100%)',
            boxShadow: '0 20px 45px rgba(15, 23, 42, .25)',
            border: '4px solid rgba(255, 255, 255, .8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
              color: '#0F172A',
            }}
          >
            50/30/20
          </div>
          {investConfig && (
            <div style={{ background: 'rgba(14,165,233,.08)', border: '1px solid rgba(14,165,233,.25)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 16, color: 'var(--navy)' }}>
                ⭐ {investConfig.label} ({investConfig.percent}%) — {investConfig.description}
              </div>
              <div className="input-grid">
                {inp('Investasi & Amal', investasi, 'investasi')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Kategori ini hanya dihitung saat menggunakan metode {budgetMethods.balanced.badge}.</div>
            </div>
          )}
        </div>
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot helper</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle className="robot-antenna" cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8" />
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53" />
            <circle className="robot-eye" cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="35" cy="33" r="2.5" fill="#fff" />
            <circle className="robot-eye" cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="55" cy="33" r="2.5" fill="#fff" />
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6" />
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448" />
            <rect className="robot-badge" x="32" y="62" width="26" height="18" rx="4" fill="#0D9488" opacity="0.8" />
            <text x="45" y="75" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fff">50/30</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <g className="robot-pie">
              <circle cx="82" cy="54" r="10" fill="#fff" stroke="#0D9488" strokeWidth="1.5" />
              <path d="M82 54 L82 44 A10 10 0 0 1 90.5 58 Z" fill="#0D9488" />
              <path d="M82 54 L90.5 58 A10 10 0 0 1 74.5 61 Z" fill="#14b8a6" />
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
            <TipsCard
              title="💡 Prinsip 50/30/20"
              items={[
                { icon: '🔴', text: '50% Kebutuhan — Sewa, makan, transportasi, tagihan. Kebutuhan pokok yang tidak bisa dihindari.' },
                { icon: '🟡', text: '30% Keinginan — Hiburan, makan di luar, shopping. Boleh, tapi terkontrol.' },
                { icon: '🟢', text: '20% Tabungan — Investasi, dana darurat, dan tujuan keuangan jangka panjang.' },
                { icon: '🎯', text: 'Dana darurat — Target 3-6x pengeluaran bulanan sebelum mulai investasi agresif.' },
              ]}
            />
            <RelatedToolsCard
              items={[
                { icon: '💰', name: 'Kalkulator Gaji', desc: 'Hitung THP kamu dulu', href: '/tools/gaji' },
                { icon: '💹', name: 'Compound Interest', desc: 'Investasikan sisa budget', href: '/tools/compound' },
                { icon: '📈', name: 'ROI Calculator', desc: 'Cek return investasi', href: '/tools/roi' },
              ]}
            />
            <KamusCard
              terms={[
                { term: 'Metode 50/30/20', def: '50% kebutuhan, 30% keinginan, 20% tabungan/investasi.' },
                { term: 'Kebutuhan', def: 'Pengeluaran wajib seperti sewa, makan, transportasi, tagihan.' },
                { term: 'Keinginan', def: 'Pengeluaran opsional seperti hiburan, makan di luar, belanja.' },
                { term: 'THP', def: 'Take Home Pay, gaji bersih yang diterima setelah semua potongan.' },
                { term: 'Dana Darurat', def: 'Tabungan cadangan untuk keadaan tak terduga (3-6 bulan pengeluaran).' },
                { term: 'Over Budget', def: 'Kondisi di mana total pengeluaran melebihi penghasilan bulanan.' },
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
          <div className="calc-title"><span className="calc-title-dot" />{methodConfig.title}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginBottom: 16 }}>
            {(['classic', 'balanced'] as BudgetMethod[]).map(option => {
              const cfg = budgetMethods[option];
              return (
                <button
                  key={option}
                  type="button"
                  className={`mode-btn${method === option ? ' active' : ''}`}
                  onClick={() => {
                    setMethod(option);
                    setShow(false);
                    setErrors({});
                  }}
                  style={{ padding: 10, borderRadius: 12, justifyContent: 'center', flexDirection: 'column', gap: 4 }}
                >
                  <strong style={{ fontSize: 12 }}>{cfg.badge}</strong>
                  <span style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>{cfg.summary}</span>
                </button>
              );
            })}
          </div>
          <div className="input-grid">
            <div className="input-group full">
              <label htmlFor="thp-input" className="input-label">Penghasilan Bersih / Bulan (THP)</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`calc-input has-prefix${errors.thp ? ' input-error' : ''}`}
                  id="thp-input"
                  value={thp}
                  onChange={e => {
                    setField('thp', parseNumber(e.target.value));
                    setErrors(prev => ({ ...prev, thp: '' }));
                  }}
                />
              </div>
              <input
                type="range"
                className="slider"
                min={2000000}
                max={100000000}
                step={500000}
                value={thp}
                onChange={e => setField('thp', parseNumber(e.target.value))}
              />
              <div className="slider-labels"><span>Rp 2jt</span><span>Rp 100jt</span></div>
              {errors.thp && <div className="error-msg">{errors.thp}</div>}
            </div>
          </div>
          <div style={{ background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 16, color: 'var(--navy)' }}>
              🔴 {needsConfig?.label ?? 'Kebutuhan'} ({needsConfig?.percent ?? 50}%) — {needsConfig?.description ?? 'Kebutuhan pokok bulanan.'}
            </div>
            <div className="input-grid">
              {inp('Sewa / KPR', sewa, 'sewa')}
              {inp('Makan & Belanja', makan, 'makan')}
              {inp('Transportasi', transport, 'transport')}
              {inp('Tagihan & Utilitas', tagihan, 'tagihan')}
            </div>
          </div>
          <div style={{ background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.15)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 16, color: 'var(--navy)' }}>
              🟡 {wantsConfig?.label ?? 'Keinginan'} ({wantsConfig?.percent ?? 30}%) — {wantsConfig?.description ?? 'Hiburan dan gaya hidup.'}
            </div>
            <div className="input-grid">
              {inp('Makan di Luar', dineout, 'dineout')}
              {inp('Hiburan & Streaming', hiburan, 'hiburan')}
              {inp('Shopping & Hobi', shopping, 'shopping')}
              {inp('Lainnya', lainnya, 'lainnya')}
            </div>
          </div>
          <div style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 16, color: 'var(--navy)' }}>
              🟢 {savingsConfig?.label ?? 'Tabungan & Darurat'} ({savingsConfig?.percent ?? 20}%) — {savingsConfig?.description ?? 'Dana masa depan dan darurat.'}
            </div>
            <div className="input-grid">
              {inp('Tabungan / Investasi', tabungan, 'tabungan')}
              {inp('Dana Darurat', darurat, 'darurat')}
            </div>
          </div>
          {show && (
            <div>
              <div className="result-divider" />
              <div className="result-title-label">Analisis Budget Bulanan</div>
              <div className="result-grid">
                <div className="result-card highlight">
                  <div className="result-label">Sisa Uang</div>
                  <div className={`result-value${sisa < 0 ? ' value-negative' : ''}`}>
                    {formatRupiah(sisa)}
                  </div>
                  <div className="result-sub">{monthlyStatusLabel}</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Total Pengeluaran</div>
                  <div className="result-value">{formatRupiah(total)}</div>
                  <div className="result-sub">Semua kategori</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Skor Budget</div>
                  <div className="result-value">{skor}</div>
                  <div className="result-sub">Berbasis {methodConfig.badge}</div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 12,
                  padding: 14,
                  borderRadius: 12,
                  background: sisa >= 0 ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)',
                  border: `1px solid ${sisa >= 0 ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'}`,
                  color: sisa >= 0 ? '#047857' : '#b91c1c',
                }}
              >
                {monthlyStatusDetail}
              </div>
              <table className="result-table">
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th>Target</th>
                    <th>Aktual</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryAnalysis.map(({ cat, target, actual, actualPct, statusLabel, statusDetail }) => (
                    <tr key={cat.id}>
                      <td>{cat.label}</td>
                      <td>{cat.percent}% ({formatRupiah(target)})</td>
                      <td>{actualPct.toFixed(1)}% ({formatRupiah(actual)})</td>
                      <td>
                        <div>{statusLabel}</div>
                        {statusDetail && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{statusDetail}</div>}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>Sisa</td>
                    <td>Rp 0</td>
                    <td colSpan={2} className={sisa < 0 ? 'negative' : ''}>{formatRupiah(sisa)}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: 16, padding: 16, background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 12, fontSize: 12, lineHeight: 1.8, color: '#92400E' }}>
                {saran}
              </div>
              <div className="action-bar" style={{ gap: 8 }}>
                <button type="button" className="action-btn" onClick={resetBudget}>
                  🔁 Reset
                </button>
                <button type="button" className="action-btn copy" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>
                  📋 Copy Hasil
                </button>
                <button type="button" className="action-btn share" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>
                  🔗 Share
                </button>
                <button type="button" className="action-btn pdf" onClick={exportPDF}>
                  📄 Export PDF
                </button>
                <SaveHistoryButton
                  toolId="budget"
                  toolName="Budget Planner"
                  inputs={{ ...inputs, method }}
                  result={{ sisa, total, kebutuhan, keinginan, saving, investasi, method }}
                  disabled={!show}
                />
              </div>
              <p className="calc-disclaimer">* Metode {methodConfig.badge} adalah panduan umum untuk alokasi anggaran. Sesuaikan dengan prioritas pribadi dan konsultasikan dengan penasihat keuangan bila perlu.</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Budget Planner" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="budget" /></div>
      <FooterSimple />
    </>
  );
}
