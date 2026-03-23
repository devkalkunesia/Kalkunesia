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
import { formatRupiah, formatNumber, parseNumber, copyResult, shareResult, exportPDF, validateInput, showToast } from '@/lib/utils'
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';

const faqItems = [
  { question: 'Bagaimana menghitung setoran bulanan?', answer: 'Jika tanpa bunga: setoran = kekurangan / bulan. Dengan bunga: menggunakan rumus PMT (Payment) yang memperhitungkan compound interest.' },
  { question: 'Instrumen apa yang cocok?', answer: 'Target < 1 tahun: tabungan biasa. 1-3 tahun: deposito atau reksa dana pasar uang. > 3 tahun: reksa dana pendapatan tetap atau campuran.' },
  { question: 'Tips menabung konsisten?', answer: 'Gunakan autodebet di awal bulan, pisahkan rekening tabungan tujuan dari rekening sehari-hari, dan visualisasikan progress secara berkala.' },
  { question: 'Apa itu tabungan berjangka?', answer: 'Tabungan dengan komitmen setoran rutin dan jangka waktu tertentu. Bunga biasanya lebih tinggi dari tabungan biasa dan ada penalti jika ditarik sebelum waktunya.' },
];

const tabunganLdJson = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Kalkulator Tabungan Tujuan — Kalkunesia',
  description: 'Hitung setoran bulanan untuk target tabungan.',
  url: 'https://kalkunesia.com/tools/tabungan-tujuan',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
  provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
});

export default function TabunganTujuanPage() {
  const [inputs, setInputs] = useLocalStorage('kalkunesia_tabungan_tujuan_inputs', {
    namaTujuan: 'DP Rumah', target: 100000000, tabunganAda: 20000000, targetBulan: 24, returnTahunan: 5, inflasiTarget: 3.5,
  });
  const { namaTujuan, target, tabunganAda, targetBulan, returnTahunan, inflasiTarget } = inputs;
  const setField = (k: string, v: number | string) => setInputs(prev => ({ ...prev, [k]: v }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  useScrollReveal(); useBackToTop();

  const targetSetelahInflasi = target * Math.pow(1 + inflasiTarget / 100, targetBulan / 12);
  const kekurangan = Math.max(0, targetSetelahInflasi - tabunganAda);
  const rBulanan = returnTahunan / 100 / 12;
  const n = targetBulan;

  // FV of existing savings
  const fvTabungan = rBulanan > 0 ? tabunganAda * Math.pow(1 + rBulanan, n) : tabunganAda;
  const gapAfterFv = Math.max(0, targetSetelahInflasi - fvTabungan);

  // PMT needed
  let setoranBulanan = 0;
  if (gapAfterFv > 0 && n > 0) {
    if (rBulanan > 0) { setoranBulanan = gapAfterFv * rBulanan / (Math.pow(1 + rBulanan, n) - 1); }
    else { setoranBulanan = gapAfterFv / n; }
  }

  const totalSetoran = setoranBulanan * n;
  const totalReturn = targetSetelahInflasi - tabunganAda - totalSetoran;
  const progress = targetSetelahInflasi > 0 ? Math.min(100, (tabunganAda / targetSetelahInflasi) * 100) : 0;

  // Timeline
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + targetBulan);
  const bulanNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const targetLabel = `${bulanNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
  const milestoneRows = [25, 50, 75, 100].map(level => {
    const targetMilestone = targetSetelahInflasi * (level / 100);
    const kebutuhan = Math.max(0, targetMilestone - tabunganAda);
    const bulanEstimasi = setoranBulanan > 0 ? Math.min(targetBulan, Math.max(0, Math.ceil(kebutuhan / setoranBulanan))) : 0;
    const d = new Date(now.getFullYear(), now.getMonth() + bulanEstimasi);
    return {
      level,
      targetMilestone,
      bulanEstimasi,
      label: `${bulanNames[d.getMonth()]} ${d.getFullYear()}`,
    };
  });

  const resetForm = () => {
    setInputs({
      namaTujuan: 'DP Rumah',
      target: 100000000,
      tabunganAda: 20000000,
      targetBulan: 24,
      returnTahunan: 5,
      inflasiTarget: 3.5,
    });
    setErrors({});
    setShow(false);
  };

  const hitung = useCallback(() => {
    const e: Record<string, string> = {};
    const v1 = validateInput(target, { min: 100000, required: true, label: 'Target dana' });
    if (v1) e.target = v1;
    const v2 = validateInput(targetBulan, { min: 1, max: 600, required: true, label: 'Target waktu' });
    if (v2) e.targetBulan = v2;
    const v3 = validateInput(inflasiTarget, { min: 0, max: 20, required: true, label: 'Inflasi target' });
    if (v3) e.inflasiTarget = v3;
    setErrors(e);
    if (Object.keys(e).length) return;
    setShow(true);
  }, [target, targetBulan, inflasiTarget]);

  useEffect(() => { const t = setTimeout(hitung, 300); return () => clearTimeout(t); }, [hitung]);

  const handleCopy = () => { copyResult(); showToast('✅ Hasil disalin!'); };
  const handleShare = () => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); };

  return (
    <>
      <script type="application/ld+json">{tabunganLdJson}</script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Tabungan Tujuan" />
      <div className="tool-hero-wrapper">
        <ToolHero icon="🎯" badge="🎯" title="Kalkulator Tabungan Tujuan" subtitle="Hitung setoran bulanan untuk mencapai target tabungan — DP rumah, dana nikah, liburan, atau tujuan apapun." tags={['✓ Target Fleksibel', '✓ Progress', '✓ Timeline', '✓ Gratis']} />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot tabungan tujuan</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle className="robot-antenna" cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8" />
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53" />
            <circle className="robot-eye" cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="35" cy="33" r="2.5" fill="#fff" />
            <circle className="robot-eye" cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="55" cy="33" r="2.5" fill="#fff" />
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6" />
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448" />
            <rect className="robot-badge" x="36" y="62" width="18" height="18" rx="4" fill="#0D9488" opacity="0.85" />
            <text x="45" y="75" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">🎯</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <g className="robot-pig">
              <ellipse cx="72" cy="90" rx="12" ry="8" fill="#f9a8d4" />
              <circle cx="81" cy="88" r="3" fill="#f472b6" />
              <rect x="66" y="84" width="10" height="2" rx="1" fill="#0D9488" />
            </g>
            <rect x="26" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
            <rect x="50" y="92" width="14" height="14" rx="6" fill="#1B3C53" />
          </svg>
        </div>
      </div>
      <ToolLayout sidebar={<>
        {/* <AdSenseBox size="rectangle" /> */}
        <TipsCard title="💡 Tips Menabung" items={[
          { icon: '🏦', text: 'Gunakan autodebet di awal bulan agar konsisten' },
          { icon: '📊', text: 'Pisahkan rekening tabungan tujuan dari rekening sehari-hari' },
          { icon: '💰', text: 'Target < 1 tahun: tabungan biasa. > 1 tahun: deposito/reksa dana' },
          { icon: '📋', text: 'Review progress setiap bulan untuk tetap on track' },
        ]} />
        <RelatedToolsCard items={[
          { icon: '🛡️', name: 'Dana Darurat', desc: 'Target dana darurat', href: '/tools/dana-darurat' },
          { icon: '💹', name: 'Compound Interest', desc: 'Bunga berbunga', href: '/tools/compound' },
          { icon: '📊', name: 'Budget Planner', desc: 'Anggaran 50/30/20', href: '/tools/budget' },
        ]} />
        <KamusCard terms={[
          { term: 'PMT', def: 'Payment, jumlah setoran rutin yang diperlukan untuk mencapai target tabungan.' },
          { term: 'FV', def: 'Future Value, nilai uang di masa depan setelah diperhitungkan bunga dan waktu.' },
          { term: 'DCA', def: 'Dollar Cost Averaging, strategi menabung/investasi rutin tanpa memperhatikan harga.' },
          { term: 'Autodebet', def: 'Transfer otomatis ke rekening tabungan di awal bulan setiap bulannya.' },
          { term: 'Progress', def: 'Persentase pencapaian target tabungan dari dana yang sudah terkumpul.' },
          { term: 'Jangka Waktu', def: 'Periode waktu dalam bulan untuk mencapai target tabungan.' },
        ]} />
        <BlogCard posts={[
          { title: 'Urutan Prioritas Keuangan yang Benar', category: 'Perencanaan', readTime: '5 menit', slug: 'prioritas-keuangan' },
          { title: 'Dana Darurat: Berapa yang Ideal?', category: 'Perencanaan', readTime: '4 menit', slug: 'dana-darurat-ideal' },
        ]} />
      </>}> 
        <div className="calc-card">
          <div className="calc-title"><span className="calc-title-dot" />Tabungan Tujuan</div>
          <div className="input-grid">
            <div className="input-group full">
              <label htmlFor="namaTujuan" className="input-label">Nama Tujuan</label>
              <div className="input-wrap">
                <input id="namaTujuan" type="text" className="calc-input" value={namaTujuan} onChange={e => setField('namaTujuan', e.target.value)} placeholder="contoh: DP Rumah" />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="targetDana" className="input-label">Target Dana</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="targetDana" type="text" inputMode="numeric" className={`calc-input${errors.target ? ' input-error' : ''}`} value={formatNumber(target)} onChange={e => { setField('target', parseNumber(e.target.value)); setErrors({}); }} />
              </div>
              {errors.target && <div className="error-msg">{errors.target}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="tabunganAda" className="input-label">Tabungan yang Sudah Ada</label>
              <div className="input-wrap">
                <span className="input-prefix">Rp</span>
                <input id="tabunganAda" type="text" inputMode="numeric" className="calc-input" value={formatNumber(tabunganAda)} onChange={e => setField('tabunganAda', parseNumber(e.target.value))} />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="targetWaktu" className="input-label">Target Waktu</label>
              <div className="input-wrap">
                <input id="targetWaktu" type="text" inputMode="numeric" className={`calc-input${errors.targetBulan ? ' input-error' : ''}`} value={targetBulan} onChange={e => { setField('targetBulan', parseNumber(e.target.value)); setErrors({}); }} min={1} max={600} />
                <span className="input-suffix">bulan</span>
              </div>
              {errors.targetBulan && <div className="error-msg">{errors.targetBulan}</div>}
            </div>
            <div className="input-group">
              <label htmlFor="returnTahunan" className="input-label">Estimasi Return / Tahun</label>
              <div className="input-wrap">
                <input id="returnTahunan" type="text" inputMode="numeric" className="calc-input" value={formatNumber(returnTahunan)} onChange={e => setField('returnTahunan', parseNumber(e.target.value))} step={0.5} />
                <span className="input-suffix">%</span>
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="inflasiTarget" className="input-label">Inflasi Target / Tahun</label>
              <div className="input-wrap">
                <input id="inflasiTarget" type="text" inputMode="numeric" className={`calc-input${errors.inflasiTarget ? ' input-error' : ''}`} value={formatNumber(inflasiTarget)} onChange={e => { setField('inflasiTarget', parseNumber(e.target.value)); setErrors({}); }} step={0.1} />
                <span className="input-suffix">%</span>
              </div>
              {errors.inflasiTarget && <div className="error-msg">{errors.inflasiTarget}</div>}
            </div>
          </div>
          {show && (
            <div>
              <div className="result-divider" />
              <div className="result-title-label">Rencana Tabungan: {namaTujuan || 'Tujuan'}</div>
              <div className="result-grid">
                <div className="result-card highlight">
                  <div className="result-label">Setoran / Bulan</div>
                  <div className="result-value">{formatRupiah(setoranBulanan)}</div>
                  <div className="result-sub">Selama {targetBulan} bulan</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Target Masa Depan</div>
                  <div className="result-value">{formatRupiah(targetSetelahInflasi)}</div>
                  <div className="result-sub">Target setelah inflasi {inflasiTarget}%</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Kekurangan</div>
                  <div className="result-value">{formatRupiah(kekurangan)}</div>
                  <div className="result-sub">Target masa depan - tabungan ada</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Tercapai Pada</div>
                  <div className="result-value" style={{ fontSize: 16 }}>📅 {targetLabel}</div>
                  <div className="result-sub">{(targetBulan / 12).toFixed(1)} tahun lagi</div>
                </div>
              </div>
              <div className="bracket-badge">Target: <strong>{targetLabel}</strong> — Progress: <strong>{progress.toFixed(1)}%</strong> terhadap target setelah inflasi</div>
              <div style={{ background: 'var(--border)', borderRadius: 8, height: 8, margin: '16px 0', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', borderRadius: 8, background: progress >= 100 ? 'linear-gradient(90deg, #0D9488, #2DD4BF)' : 'linear-gradient(90deg, #1B3C53, #296374)', transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginBottom: 16 }}>Progress: {progress.toFixed(1)}% dari target</div>
              <table className="result-table">
                <thead>
                  <tr><th>Komponen</th><th>Nilai</th></tr>
                </thead>
                <tbody>
                  <tr><td>Target dana saat ini</td><td className="right">{formatRupiah(target)}</td></tr>
                  <tr><td>Target setelah inflasi</td><td className="right">{formatRupiah(targetSetelahInflasi)}</td></tr>
                  <tr><td>Tabungan yang ada</td><td className="right">{formatRupiah(tabunganAda)}</td></tr>
                  <tr><td>Total setoran</td><td className="right">{formatRupiah(totalSetoran)}</td></tr>
                  <tr><td>Keuntungan dari return</td><td className="right">{formatRupiah(Math.max(0, totalReturn))}</td></tr>
                  <tr><td><strong>Setoran / bulan</strong></td><td className="right"><strong>{formatRupiah(setoranBulanan)}</strong></td></tr>
                </tbody>
              </table>
              <div style={{ marginTop: 14, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(15,23,42,.04)' }}>
                      <th style={{ textAlign: 'left', padding: '10px 12px' }}>Milestone</th>
                      <th style={{ textAlign: 'right', padding: '10px 12px' }}>Target</th>
                      <th style={{ textAlign: 'right', padding: '10px 12px' }}>Estimasi Tercapai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestoneRows.map(row => (
                      <tr key={row.level}>
                        <td style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>{row.level}%</td>
                        <td style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>{formatRupiah(row.targetMilestone)}</td>
                        <td style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>{row.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="action-bar">
                <button type="button" className="action-btn copy" onClick={handleCopy}>📋 Copy</button>
                <button type="button" className="action-btn share" onClick={handleShare}>🔗 Share</button>
                <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
                <button type="button" className="action-btn reset" onClick={resetForm}>↺ Reset</button>
                <SaveHistoryButton toolId="tabungan-tujuan" toolName="Tabungan Tujuan" inputs={{ namaTujuan, target, tabunganAda, targetBulan, returnTahunan, inflasiTarget }} result={{ setoranBulanan, kekurangan, targetLabel, targetSetelahInflasi }} disabled={!show} />
              </div>
              <p className="calc-disclaimer">* Setoran bulanan dihitung menggunakan rumus PMT dengan asumsi return konstan. Return aktual instrumen investasi dapat berfluktuasi. Mulai sedini mungkin untuk memaksimalkan manfaat compound interest.</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Tabungan Tujuan" items={faqItems} />
        </div>
      </ToolLayout>
      <div style={{ marginTop: '-64px' }}><MoreTools exclude="tabungan-tujuan" /></div>
      <FooterSimple />
    </>
  );
}
