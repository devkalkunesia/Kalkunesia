'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import ToolHero from '@/components/ToolHero';
import ToolLayout from '@/components/ToolLayout';
import AdSenseBox from '@/components/AdSenseBox';
import FaqSection from '@/components/FaqSection';
import MoreTools from '@/components/MoreTools';
import { TipsCard, RelatedToolsCard, KamusCard, BlogCard } from '@/components/SidebarCards';
import { FooterSimple } from '@/components/Footer';
import SaveHistoryButton from '@/components/SaveHistoryButton';
import {
  copyResult,
  exportPDF,
  formatNumber,
  formatRupiah,
  parseNumber,
  shareResult,
  validateInput,
} from '@/lib/utils';
import { useBackToTop, useLocalStorage, useScrollReveal } from '@/lib/hooks';

type Mode = 'pkwt' | 'pbpu';
type PbpuClass = 'kelas-1' | 'kelas-2' | 'kelas-3';

interface Inputs {
  mode: Mode;
  gaji: number;
  pbpuClass: PbpuClass;
}

const defaults: Inputs = {
  mode: 'pkwt',
  gaji: 8000000,
  pbpuClass: 'kelas-2',
};

const pbpuContribution: Record<PbpuClass, number> = {
  'kelas-1': 160000,
  'kelas-2': 110000,
  'kelas-3': 42000,
};

const faqItems = [
  {
    question: 'Berapa iuran BPJS Kesehatan untuk karyawan?',
    answer: 'Untuk pekerja penerima upah (PKWT/PPU), iuran BPJS Kesehatan sebesar 5% dari upah dengan batas atas Rp 12 juta per bulan. Porsi perusahaan 4% dan karyawan 1%.',
  },
  {
    question: 'Apa perbedaan JHT, JP, JKK, dan JKM?',
    answer: 'JHT dan JP adalah tabungan/pensiun jangka panjang, sementara JKK dan JKM adalah perlindungan risiko kecelakaan kerja dan kematian. JKK dan JKM dibayar perusahaan.',
  },
  {
    question: 'Bagaimana iuran mandiri PBPU?',
    answer: 'Untuk PBPU (mandiri), iuran kesehatan dibayar per kelas layanan: kelas 1, kelas 2, atau kelas 3. Simulasi ini memakai nominal iuran bulanan tiap kelas.',
  },
];

const schemaData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Kalkulator BPJS 2025 — Kalkunesia',
  description: 'Hitung iuran BPJS Kesehatan dan Ketenagakerjaan untuk PKWT maupun PBPU kelas 1/2/3.',
  url: 'https://kalkunesia.com/tools/bpjs',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
  provider: { '@type': 'Organization', name: 'Kalkunesia', url: 'https://kalkunesia.com' },
});

export default function BPJSPage() {
  const [inputs, setInputs] = useLocalStorage<Inputs>('kalkunesia_bpjs_inputs', defaults);
  const { mode, gaji, pbpuClass } = inputs;
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

  const data = useMemo(() => {
    const capKesehatan = 12000000;
    const capJP = 9077600;

    if (mode === 'pbpu') {
      const iuranPbpu = pbpuContribution[pbpuClass];
      return {
        dasarKesehatan: 0,
        kesehatanPerusahaan: 0,
        kesehatanKaryawan: iuranPbpu,
        jhtPerusahaan: 0,
        jhtKaryawan: 0,
        jpPerusahaan: 0,
        jpKaryawan: 0,
        jkkPerusahaan: 0,
        jkmPerusahaan: 0,
      };
    }

    const dasarKesehatan = Math.min(gaji, capKesehatan);
    const dasarJP = Math.min(gaji, capJP);

    const kesehatanPerusahaan = dasarKesehatan * 0.04;
    const kesehatanKaryawan = dasarKesehatan * 0.01;

    const jhtPerusahaan = gaji * 0.037;
    const jhtKaryawan = gaji * 0.02;

    const jpPerusahaan = dasarJP * 0.02;
    const jpKaryawan = dasarJP * 0.01;

    const jkkPerusahaan = gaji * 0.0024;
    const jkmPerusahaan = gaji * 0.003;

    return {
      dasarKesehatan,
      kesehatanPerusahaan,
      kesehatanKaryawan,
      jhtPerusahaan,
      jhtKaryawan,
      jpPerusahaan,
      jpKaryawan,
      jkkPerusahaan,
      jkmPerusahaan,
    };
  }, [mode, gaji, pbpuClass]);

  const totalPerusahaan =
    data.kesehatanPerusahaan +
    data.jhtPerusahaan +
    data.jpPerusahaan +
    data.jkkPerusahaan +
    data.jkmPerusahaan;
  const totalKaryawan = data.kesehatanKaryawan + data.jhtKaryawan + data.jpKaryawan;
  const totalIuran = totalPerusahaan + totalKaryawan;

  const summary =
    mode === 'pkwt'
      ? `Dengan gaji ${formatRupiah(gaji)}, estimasi total iuran BPJS bulanan ${formatRupiah(totalIuran)}. Porsi perusahaan sekitar ${formatRupiah(totalPerusahaan)} dan porsi karyawan ${formatRupiah(totalKaryawan)}.`
      : `Sebagai PBPU ${pbpuClass.replace('-', ' ')}, estimasi iuran kesehatan mandiri bulanan ${formatRupiah(totalKaryawan)}. Simulasi ini fokus pada iuran kesehatan per kelas layanan.`;

  const hitung = useCallback(() => {
    const nextErrors: Record<string, string> = {};

    if (mode === 'pkwt') {
      const msg = validateInput(gaji, {
        min: 1000000,
        max: 500000000,
        required: true,
        label: 'Gaji bulanan',
      });
      if (msg) nextErrors.gaji = msg;
    }

    setErrors(nextErrors);
    setShow(Object.keys(nextErrors).length === 0);
  }, [mode, gaji]);

  useEffect(() => {
    const timer = setTimeout(hitung, 250);
    return () => clearTimeout(timer);
  }, [hitung]);

  return (
    <>
      <script type="application/ld+json">{schemaData}</script>
      <Navbar variant="simple" />
      <Breadcrumb toolName="Kalkulator BPJS" />

      <div className="tool-hero-wrapper">
        <ToolHero
          icon="🛡️"
          badge="BPJS 2025"
          title="Kalkulator BPJS"
          subtitle="Hitung iuran BPJS Kesehatan dan Ketenagakerjaan untuk PKWT maupun PBPU kelas 1/2/3."
          tags={['Kesehatan 5%', 'JHT 5.7%', 'JP 3%', 'JKK + JKM']}
        />
      </div>

      <ToolLayout
        sidebar={
          <>
            <AdSenseBox size="small" />
            <TipsCard
              title="💡 Patokan 2025"
              items={[
                { icon: '🏥', text: 'BPJS Kesehatan: 5% (4% perusahaan, 1% karyawan), batas upah Rp 12 juta.' },
                { icon: '🧾', text: 'JHT total 5.7%: perusahaan 3.7% + karyawan 2%.' },
                { icon: '📉', text: 'JP total 3% dengan batas upah Rp 9.077.600.' },
              ]}
            />
            <RelatedToolsCard
              items={[
                { icon: '📋', name: 'PPh 21', desc: 'Pajak gaji bulanan', href: '/tools/pph-21' },
                { icon: '💰', name: 'Kalkulator Gaji', desc: 'Take home pay', href: '/tools/gaji' },
                { icon: '🏢', name: 'PPh 25', desc: 'Angsuran pajak badan', href: '/tools/pph-25' },
              ]}
            />
            <KamusCard
              terms={[
                { term: 'PKWT/PPU', def: 'Pekerja dengan upah bulanan dan iuran dibagi perusahaan-karyawan.' },
                { term: 'PBPU', def: 'Peserta mandiri yang membayar iuran kesehatan sendiri sesuai kelas.' },
                { term: 'JHT', def: 'Jaminan Hari Tua untuk tabungan jangka panjang pekerja.' },
                { term: 'JP', def: 'Jaminan Pensiun dengan batas upah maksimum per bulan.' },
              ]}
            />
            <BlogCard
              posts={[
                { title: 'Memahami Potongan BPJS di Slip Gaji', category: 'Pajak & Gaji', readTime: '5 menit', slug: 'potongan-bpjs-slip-gaji' },
                { title: 'Perbedaan BPJS Kesehatan dan Ketenagakerjaan', category: 'Keuangan', readTime: '4 menit', slug: 'bpjs-kesehatan-vs-ketenagakerjaan' },
              ]}
            />
          </>
        }
      >
        <div className="calc-card">
          <div className="mode-toggle" style={{ marginBottom: 16 }}>
            <button
              type="button"
              className={`mode-btn${mode === 'pkwt' ? ' active' : ''}`}
              onClick={() => setField('mode', 'pkwt')}
            >
              PKWT / PPU
            </button>
            <button
              type="button"
              className={`mode-btn${mode === 'pbpu' ? ' active' : ''}`}
              onClick={() => setField('mode', 'pbpu')}
            >
              Mandiri PBPU
            </button>
          </div>

          <div className="input-grid">
            {mode === 'pkwt' ? (
              <div className="input-group full">
                <label htmlFor="bpjs-gaji" className="input-label">
                  Gaji Bulanan
                </label>
                <div className="input-wrap">
                  <span className="input-prefix">Rp</span>
                  <input
                    id="bpjs-gaji"
                    type="text"
                    inputMode="numeric"
                    className={`calc-input has-prefix${errors.gaji ? ' input-error' : ''}`}
                    value={formatNumber(gaji)}
                    onChange={e => {
                      setField('gaji', parseNumber(e.target.value));
                      setErrors(prev => ({ ...prev, gaji: '' }));
                    }}
                  />
                </div>
                <input
                  type="range"
                  className="slider"
                  min={1000000}
                  max={50000000}
                  step={500000}
                  value={Math.max(1000000, Math.min(gaji, 50000000))}
                  onChange={e => setField('gaji', Number(e.target.value))}
                />
                <div className="slider-labels">
                  <span>Rp 1jt</span>
                  <span>Rp 50jt</span>
                </div>
                {errors.gaji && <div className="error-msg">{errors.gaji}</div>}
              </div>
            ) : (
              <div className="input-group full">
                <label htmlFor="bpjs-kelas" className="input-label">
                  Kelas PBPU
                </label>
                <div className="select-wrapper">
                  <select
                    id="bpjs-kelas"
                    className="calc-select"
                    value={pbpuClass}
                    onChange={e => setField('pbpuClass', e.target.value as PbpuClass)}
                  >
                    <option value="kelas-1">Kelas 1</option>
                    <option value="kelas-2">Kelas 2</option>
                    <option value="kelas-3">Kelas 3</option>
                  </select>
                </div>
                <p className="input-hint">Estimasi iuran bulanan: {formatRupiah(pbpuContribution[pbpuClass])}</p>
              </div>
            )}
          </div>

          {show && (
            <div className="result-section show" style={{ marginTop: 28 }}>
              <div className="result-grid">
                <div className="result-card">
                  <div className="result-label">Total Iuran</div>
                  <div className="result-value">{formatRupiah(totalIuran)}</div>
                  <div className="result-sub">Per bulan</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Porsi Perusahaan</div>
                  <div className="result-value">{formatRupiah(totalPerusahaan)}</div>
                  <div className="result-sub">Employer cost</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Porsi Karyawan</div>
                  <div className="result-value">{formatRupiah(totalKaryawan)}</div>
                  <div className="result-sub">Potongan pekerja</div>
                </div>
              </div>

              <div style={{ marginTop: 14, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <tbody>
                    {mode === 'pkwt' ? (
                      <>
                        <tr>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>Dasar BPJS Kesehatan (max Rp 12 jt)</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{formatRupiah(data.dasarKesehatan)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>Kesehatan 4% (Perusahaan)</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{formatRupiah(data.kesehatanPerusahaan)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>Kesehatan 1% (Karyawan)</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{formatRupiah(data.kesehatanKaryawan)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>JHT 3.7% (Perusahaan)</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{formatRupiah(data.jhtPerusahaan)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>JHT 2% (Karyawan)</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{formatRupiah(data.jhtKaryawan)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>JP 2% (Perusahaan)</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{formatRupiah(data.jpPerusahaan)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>JP 1% (Karyawan)</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{formatRupiah(data.jpKaryawan)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>JKK 0.24% (Perusahaan)</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{formatRupiah(data.jkkPerusahaan)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '10px 14px' }}>JKM 0.3% (Perusahaan)</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right' }}>{formatRupiah(data.jkmPerusahaan)}</td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td style={{ padding: '10px 14px' }}>Iuran BPJS Kesehatan PBPU ({pbpuClass.replace('-', ' ')})</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>{formatRupiah(totalKaryawan)}</td>
                      </tr>
                    )}
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
                  toolId="bpjs"
                  toolName="Kalkulator BPJS"
                  inputs={{ ...inputs }}
                  result={{ totalIuran, totalPerusahaan, totalKaryawan }}
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
          <FaqSection title="FAQ — Kalkulator BPJS" items={faqItems} />
        </div>
      </ToolLayout>

      <MoreTools exclude="bpjs" />
      <FooterSimple />
    </>
  );
}
