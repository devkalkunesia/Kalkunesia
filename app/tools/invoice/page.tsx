'use client';
import Script from 'next/script';
import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import ToolHero from '@/components/ToolHero';
import ToolLayout from '@/components/ToolLayout';
import AdSenseBox from '@/components/AdSenseBox';
import FaqSection from '@/components/FaqSection';
import MoreTools from '@/components/MoreTools';
import { TipsCard, RelatedToolsCard, BlogCard, KamusCard } from '@/components/SidebarCards';
import { FooterSimple } from '@/components/Footer';
import { formatRupiah, formatNumber, parseNumber, showToast, copyResult, shareResult, exportPDF, validateInput } from '@/lib/utils'
import { useScrollReveal, useBackToTop, useLocalStorage } from '@/lib/hooks';
import SaveHistoryButton from '@/components/SaveHistoryButton';

interface InvItem { nama: string; qty: number; harga: number; }

const faqItems = [
  { question: 'Apakah invoice ini bisa dipakai untuk keperluan resmi?', answer: 'Invoice dari kalkulator ini cocok untuk tagihan informal, freelancer, UMKM. Untuk PKP yang butuh Faktur Pajak resmi, gunakan e-Faktur DJP.' },
  { question: 'Bagaimana cara download sebagai PDF?', answer: 'Klik "Cetak / Download PDF", lalu pilih "Save as PDF" di dialog cetak browser.' },
  { question: 'Apakah data invoice tersimpan?', answer: 'Tidak, data hanya ada selama sesi browser aktif. Simpan sebagai PDF untuk arsip.' },
  { question: 'Bagaimana cara membuat invoice dalam USD?', answer: 'Masukkan angka dalam USD, tulis "USD" di nama item, dan tambahkan catatan payment via Wire Transfer.' },
];

export default function InvoicePage() {
  const today = new Date().toISOString().split('T')[0];
  const due = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const [inputs, setInputs] = useLocalStorage('kalkunesia_invoice_inputs', {
    invNo: 'INV-2025-001', invDate: today, invDue: due,
    fromName: '', fromAddr: '', toName: '', toAddr: '',
    items: [
      { nama: 'Jasa Desain Website', qty: 1, harga: 5000000 },
      { nama: 'Revisi (3x)', qty: 3, harga: 500000 },
    ] as InvItem[],
    ppn: 0, diskon: 0, catatan: '',
  });
  const { invNo, invDate, invDue, fromName, fromAddr, toName, toAddr, items, ppn, diskon, catatan } = inputs;
  const setField = (k: string, v: unknown) => setInputs(prev => ({ ...prev, [k]: v }));
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useScrollReveal();
  useBackToTop();

  const updateItem = (i: number, key: keyof InvItem, val: string | number) => {
    setField('items', items.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  };
  const addItem = () => setField('items', [...items, { nama: '', qty: 1, harga: 0 }]);
  const removeItem = (i: number) => setField('items', items.filter((_, idx) => idx !== i));

  const generate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!fromName.trim()) e.fromName = 'Nama penjual wajib diisi';
    if (!toName.trim()) e.toName = 'Nama klien (pembeli) wajib diisi';
    items.forEach((item, i) => {
      const v = validateInput(item.harga, { min: 1, required: true, label: 'Nominal item' });
      if (v) e[`item_${i}_harga`] = v;
    });
    setErrors(e);
    if (Object.keys(e).length) { setShowPreview(false); return; }
    setShowPreview(true);
  }, [fromName, toName, items]);

  const subtotal = items.reduce((s, i) => s + i.qty * i.harga, 0);
  const afterDiskon = subtotal * (1 - diskon / 100);
  const ppnAmt = afterDiskon * ppn / 100;
  const grandTotal = afterDiskon + ppnAmt;

  return (
    <>
      <Navbar variant="simple" />
      <Script id="invoice-ldjson" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Invoice Generator — Kalkunesia',
          description: 'Buat invoice profesional dan cetak sebagai PDF dalam hitungan detik.',
          url: 'https://kalkunesia.com/tools/invoice',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web Browser',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
          provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
        })}
      </Script>
      <Breadcrumb toolName="Invoice Generator" />
      <div className="tool-hero-wrapper">
        <ToolHero
          icon="🧾"
          badge="INV"
          title="Invoice Generator"
          subtitle="Buat invoice/faktur profesional secara online dan cetak sebagai PDF. Gratis tanpa daftar."
          tags={['document', 'invoice']}
        />
        <div className="tool-hero-deco">
          <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Robot pembuat invoice</title>
            <line x1="45" y1="8" x2="45" y2="18" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
            <circle className="robot-antenna" cx="45" cy="6" r="4" fill="#0D9488" opacity="0.8" />
            <rect x="22" y="18" width="46" height="34" rx="10" fill="#1B3C53" />
            <circle className="robot-eye" cx="35" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="35" cy="33" r="2.5" fill="#fff" />
            <circle className="robot-eye" cx="55" cy="33" r="5" fill="#0D9488" opacity="0.9" />
            <circle className="robot-eye" cx="55" cy="33" r="2.5" fill="#fff" />
            <rect x="37" y="43" width="16" height="3" rx="1.5" fill="#0D9488" opacity="0.6" />
            <rect x="18" y="56" width="54" height="36" rx="10" fill="#213448" />
            <rect className="robot-badge" x="36" y="60" width="18" height="18" rx="4" fill="#0D9488" opacity="0.8" />
            <text x="45" y="75" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">INV</text>
            <rect x="4" y="58" width="12" height="28" rx="6" fill="#213448" />
            <rect x="74" y="58" width="12" height="28" rx="6" fill="#213448" />
            <g className="robot-doc">
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

      <ToolLayout sidebar={
        <>
          {/* <AdSenseBox size="rectangle" /> */}
          <TipsCard title="💡 Tips Invoice Profesional" items={[
            { icon: '📝', text: 'Nomor invoice berurutan — Format: INV/2025/001' },
            { icon: '⏰', text: 'Tetapkan jatuh tempo — Standar NET 30 atau NET 14' },
            { icon: '🏦', text: 'Info rekening lengkap — Bank, no. rek, nama pemilik' },
            { icon: '💼', text: 'Simpan salinan — Untuk pajak dan pembukuan' },
          ]} />
          <RelatedToolsCard items={[
            { icon: '🏢', name: 'PPh 25 Calculator', desc: 'Pajak dari usaha', href: '/tools/pph-25' },
            { icon: '💱', name: 'Currency Converter', desc: 'Invoice dalam valas', href: '/tools/currency' },
            { icon: '📈', name: 'ROI Calculator', desc: 'Analisis profitabilitas', href: '/tools/roi' },
          ]} />
          <KamusCard terms={[
            { term: 'Invoice', def: 'Dokumen tagihan resmi yang dikirim penjual kepada pembeli.' },
            { term: 'Faktur Pajak', def: 'Invoice resmi untuk PKP yang diterbitkan melalui e-Faktur DJP.' },
            { term: 'PPN', def: 'Pajak Pertambahan Nilai 11% yang wajib dipungut oleh PKP.' },
            { term: 'Diskon', def: 'Potongan harga yang diberikan dari nilai total invoice.' },
            { term: 'Jatuh Tempo', def: 'Batas waktu pembayaran yang disepakati penjual dan pembeli.' },
            { term: 'NET 30', def: 'Istilah pembayaran yang berarti invoice harus dibayar dalam 30 hari.' },
          ]} />
          <BlogCard posts={[{ title: 'Tips Kelola Cashflow untuk UMKM', category: 'Bisnis', readTime: '5 menit', slug: 'kelola-cashflow-umkm' },{ title: 'Cara Menentukan Harga Jual yang Tepat', category: 'Bisnis', readTime: '4 menit', slug: 'cara-menentukan-harga-jual' }]} />
        </>
      }>
        <div className="calc-card">
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg,var(--teal),var(--teal2))' }} />Invoice Generator</div>

          {/* Invoice info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 16 }}>
            <div className="input-group"><label className="input-label" htmlFor="invoice-number">Nomor Invoice</label><input id="invoice-number" type="text" className="calc-input" value={invNo} onChange={e => setField('invNo', e.target.value)} style={{ padding: '12px 14px' }} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="input-group"><label className="input-label" htmlFor="invoice-date">Tanggal Invoice</label><input id="invoice-date" type="date" className="calc-input" value={invDate} onChange={e => setField('invDate', e.target.value)} style={{ padding: '12px 14px' }} /></div>
            <div className="input-group"><label className="input-label" htmlFor="invoice-due">Jatuh Tempo</label><input id="invoice-due" type="date" className="calc-input" value={invDue} onChange={e => setField('invDue', e.target.value)} style={{ padding: '12px 14px' }} /></div>
          </div>

          {/* From / To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ background: 'rgba(27,60,83,.04)', border: '1px solid rgba(27,60,83,.1)', borderRadius: 12, padding: 16 }}>
              <div className="input-label" style={{ marginBottom: 12 }}>DARI (Penjual)</div>
              <input type="text" className={`calc-input${errors.fromName ? ' input-error' : ''}`} placeholder="Nama / Perusahaan" value={fromName} onChange={e => { setField('fromName', e.target.value); setErrors(prev => ({ ...prev, fromName: '' })); }} style={{ padding: '10px 14px', marginBottom: errors.fromName ? 2 : 8 }} />
              {errors.fromName && <div className="error-msg" style={{ marginBottom: 6 }}>{errors.fromName}</div>}
              <textarea className="calc-input" placeholder={'Alamat\nEmail | No. HP'} rows={3} value={fromAddr} onChange={e => setField('fromAddr', e.target.value)} style={{ padding: '10px 14px', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div style={{ background: 'rgba(27,60,83,.04)', border: '1px solid rgba(27,60,83,.1)', borderRadius: 12, padding: 16 }}>
              <div className="input-label" style={{ marginBottom: 12 }}>KEPADA (Pembeli)</div>
              <input type="text" className={`calc-input${errors.toName ? ' input-error' : ''}`} placeholder="Nama / Perusahaan" value={toName} onChange={e => { setField('toName', e.target.value); setErrors(prev => ({ ...prev, toName: '' })); }} style={{ padding: '10px 14px', marginBottom: errors.toName ? 2 : 8 }} />
              {errors.toName && <div className="error-msg" style={{ marginBottom: 6 }}>{errors.toName}</div>}
              <textarea className="calc-input" placeholder={'Alamat\nEmail | No. HP'} rows={3} value={toAddr} onChange={e => setField('toAddr', e.target.value)} style={{ padding: '10px 14px', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
          </div>

          {/* Items */}
          <div className="input-label" style={{ marginBottom: 10 }}>ITEM / LAYANAN</div>
          {items.map((item, i) => (
            <div key={`${item.nama}-${item.qty}-${item.harga}`}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 140px 32px', gap: 8, marginBottom: errors[`item_${i}_harga`] ? 2 : 8, alignItems: 'center' }}>
                <input type="text" className="calc-input" value={item.nama} onChange={e => updateItem(i, 'nama', e.target.value)} placeholder="Nama item" style={{ padding: '10px 14px' }} />
                <input type="text" inputMode="numeric" className="calc-input" value={formatNumber(item.qty)} onChange={e => updateItem(i, 'qty', parseNumber(e.target.value))} min={1} style={{ padding: '10px 14px', textAlign: 'center' }} />
                <div style={{ position: 'relative' }}><span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 10, fontFamily: 'var(--font-mono),monospace', fontSize: 10, color: 'var(--teal)', pointerEvents: 'none' }}>Rp</span><input type="text" inputMode="numeric" className={`calc-input${errors[`item_${i}_harga`] ? ' input-error' : ''}`} value={item.harga} onChange={e => { updateItem(i, 'harga', parseNumber(e.target.value)); setErrors(prev => { const next = { ...prev }; delete next[`item_${i}_harga`]; return next; }); }} style={{ padding: '10px 10px 10px 34px' }} /></div>
                <button type="button" onClick={() => removeItem(i)} style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444', borderRadius: 8, width: 32, height: 38, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              {errors[`item_${i}_harga`] && <div className="error-msg" style={{ marginBottom: 6 }}>{errors[`item_${i}_harga`]}</div>}
            </div>
          ))}
          <button type="button" onClick={addItem} style={{ background: 'rgba(13,148,136,.1)', border: '1px solid rgba(13,148,136,.3)', color: 'var(--teal)', borderRadius: 10, padding: '10px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%', marginBottom: 16 }}>+ Tambah Item</button>

          {/* PPN & Discount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="input-group"><label className="input-label" htmlFor="invoice-ppn">PPN</label><select id="invoice-ppn" className="calc-select" value={ppn} onChange={e => setField('ppn', parseNumber(e.target.value))} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 14, fontWeight: 600, color: 'var(--text)', background: 'var(--bg)', fontFamily: 'inherit', cursor: 'pointer' }}><option value={0}>Tanpa PPN</option><option value={11}>PPN 11%</option><option value={12}>PPN 12%</option></select></div>
            <div className="input-group"><label className="input-label" htmlFor="invoice-diskon">Diskon Total</label><div className="input-wrap"><input id="invoice-diskon" type="text" inputMode="numeric" className="calc-input" value={formatNumber(diskon)} onChange={e => setField('diskon', parseNumber(e.target.value))} min={0} max={100} /><span className="input-suffix">%</span></div></div>
          </div>
          <div className="input-group" style={{ marginBottom: 16 }}><label className="input-label" htmlFor="invoice-notes">Catatan / Syarat Pembayaran</label><textarea id="invoice-notes" className="calc-input" rows={2} placeholder="Pembayaran via transfer BCA 1234567890 a/n Nama" value={catatan} onChange={e => setField('catatan', e.target.value)} style={{ padding: '10px 14px', resize: 'vertical', fontFamily: 'inherit' }} /></div>

          <button type="button" onClick={generate} style={{ width: '100%', background: 'linear-gradient(135deg,var(--navy),var(--navy2))', color: '#fff', border: 'none', borderRadius: 14, padding: 15, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 18px rgba(27,60,83,.25)', transition: 'all .3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>🧾 Generate Invoice</button>

          {/* Preview */}
          {showPreview && (
            <div style={{ marginTop: 24 }}>
              <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,var(--border),transparent)', marginBottom: 24 }} />
              <div style={{ fontFamily: 'var(--font-mono),monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--teal)', marginBottom: 16 }}>Preview Invoice</div>
              <div id="invoicePreview" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                  <div><div style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)', letterSpacing: -1.5 }}>INVOICE</div><div style={{ fontFamily: 'var(--font-mono),monospace', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{invNo} · {invDate} · Due: {invDue}</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>🧮 Kalkunesia</div></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
                  <div><div style={{ fontFamily: 'var(--font-mono),monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', marginBottom: 6 }}>DARI</div><div style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{fromName}{fromAddr ? '\n' + fromAddr : ''}</div></div>
                  <div><div style={{ fontFamily: 'var(--font-mono),monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', marginBottom: 6 }}>KEPADA</div><div style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{toName}{toAddr ? '\n' + toAddr : ''}</div></div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                  <thead><tr style={{ background: 'var(--navy)' }}><th style={{ padding: '10px 14px', color: 'rgba(255,255,255,.7)', fontFamily: 'var(--font-mono),monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left' }}>Item</th><th style={{ padding: '10px 14px', color: 'rgba(255,255,255,.7)', fontFamily: 'var(--font-mono),monospace', fontSize: 9, textAlign: 'right' }}>Qty</th><th style={{ padding: '10px 14px', color: 'rgba(255,255,255,.7)', fontFamily: 'var(--font-mono),monospace', fontSize: 9, textAlign: 'right' }}>Harga</th><th style={{ padding: '10px 14px', color: 'rgba(255,255,255,.7)', fontFamily: 'var(--font-mono),monospace', fontSize: 9, textAlign: 'right' }}>Subtotal</th></tr></thead>
                  <tbody>{items.map((item, i) => (<tr key={`${item.nama}-${item.qty}-${item.harga}`}><td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>{item.nama}</td><td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--font-mono),monospace' }}>{item.qty}</td><td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--font-mono),monospace' }}>{formatRupiah(item.harga)}</td><td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--font-mono),monospace', fontWeight: 700 }}>{formatRupiah(item.qty * item.harga)}</td></tr>))}</tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ minWidth: 280 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}><span style={{ color: 'var(--muted)' }}>Subtotal</span><span style={{ fontFamily: 'var(--font-mono),monospace' }}>{formatRupiah(subtotal)}</span></div>
                    {diskon > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}><span style={{ color: 'var(--muted)' }}>Diskon ({diskon}%)</span><span style={{ fontFamily: 'var(--font-mono),monospace', color: '#ef4444' }}>-{formatRupiah(subtotal * diskon / 100)}</span></div>}
                    {ppn > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}><span style={{ color: 'var(--muted)' }}>PPN ({ppn.toFixed(0)}%)</span><span style={{ fontFamily: 'var(--font-mono),monospace' }}>{formatRupiah(ppnAmt)}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px', fontSize: 16, fontWeight: 800, borderTop: '2px solid var(--navy)', marginTop: 4 }}><span>TOTAL</span><span style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono),monospace' }}>{formatRupiah(grandTotal)}</span></div>
                  </div>
                </div>
                <div className="bracket-badge">Grand Total: <strong>{formatRupiah(grandTotal)}</strong>{ppn > 0 ? ` (termasuk PPN ${ppn}%)` : ' (tanpa PPN)'}</div>
                {catatan && <div style={{ marginTop: 24, padding: 14, background: 'rgba(27,60,83,.04)', borderRadius: 10, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>📋 {catatan}</div>}
              </div>
              <button type="button" onClick={exportPDF} style={{ background: 'linear-gradient(135deg,var(--teal),var(--teal2))', color: '#fff', border: 'none', borderRadius: 14, padding: '13px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>🖨️ Cetak / Download PDF</button>
              <div className="action-bar">
                <button type="button" className="action-btn copy" onClick={() => { copyResult(); showToast('✅ Hasil disalin!'); }}>📋 Copy</button>
                <button type="button" className="action-btn share" onClick={() => { shareResult(); showToast('🔗 Link berhasil dibagikan!'); }}>🔗 Share</button>
                <button type="button" className="action-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
                <SaveHistoryButton
                  toolId="invoice"
                  toolName="Invoice Generator"
                  inputs={{ fromName, toName, invNo, invDate, itemCount: items.length }}
                  result={{ total: grandTotal, subtotal, itemCount: items.length }}
                  disabled={items.length === 0}
                />
              </div>
              <p className="calc-disclaimer">* Invoice ini cocok untuk keperluan informal dan UMKM. Untuk PKP yang membutuhkan Faktur Pajak resmi, gunakan e-Faktur DJP Online.</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: 32 }}>
          <FaqSection title="FAQ Invoice Generator" items={faqItems} />
        </div>
      </ToolLayout>

      <div style={{ marginTop: '-64px' }}><MoreTools exclude="invoice" /></div>
      <FooterSimple />
    </>
  );
}
