'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FooterFull } from '@/components/Footer';
import { useScrollReveal, useBackToTop } from '@/lib/hooks';
import { tools, ToolInfo } from '@/lib/tools-data';
import './home.css';

const categoryOrder = ['Pajak & Gaji', 'Investasi', 'Bisnis & Keuangan', 'Perencanaan', 'Kredit & Properti', 'Keuangan Syariah', 'Ekonomi'];
const grouped: Record<string, ToolInfo[]> = tools.reduce((acc, t) => { (acc[t.category] = acc[t.category] || []).push(t); return acc; }, {} as Record<string, ToolInfo[]>);

const demoSlides = [
  { icon: '🏠', label: 'KPR Calculator', line1: 'Cicilan: Rp 4.6jt/bln', line2: 'Tenor: 20 tahun' },
  { icon: '📋', label: 'PPh 21', line1: 'Pajak: Rp 850rb/bln', line2: 'PTKP: TK/0' },
  { icon: '📈', label: 'ROI Calculator', line1: 'ROI: +24.5%', line2: 'Profit: Rp 12.2jt' },
  { icon: '💹', label: 'Compound Interest', line1: 'Hasil: Rp 156jt', line2: '10 thn @ 7%/thn' },
  { icon: '📊', label: 'Budget Planner', line1: 'Sisa: Rp 2.1jt', line2: 'Saving: 22%' },
];

export default function HomePage() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  useScrollReveal();
  useBackToTop();

  // Demo carousel interval
  useEffect(() => {
    const timer = setInterval(() => setSlideIdx(prev => (prev + 1) % demoSlides.length), 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Orb init
    document.querySelectorAll('.orb').forEach((o, i) => setTimeout(() => o.classList.add('on'), i * 180));
    // Stats bars
    setTimeout(() => {
      const b1 = document.getElementById('b1'), b2 = document.getElementById('b2'), b3 = document.getElementById('b3');
      if (b1) b1.style.width = '75%'; if (b2) b2.style.width = '60%'; if (b3) b3.style.width = '85%';
    }, 600);
    // Flip counters
    flipCounter('fr1', 24, '');
    flipCounter('fr2', 5000, 'K');
    flipCounter('fr3', 1200000, 'M');
  }, []);

  useEffect(() => {
    // 3D tilt
    const cards = cardsRef.current?.querySelectorAll('.tool-card');
    if (!cards) return;
    const handlers = new Map<Element, { move: (e: MouseEvent) => void; leave: () => void }>();
    cards.forEach(card => {
      const el = card as HTMLElement;
      const s = el.classList.contains('featured') ? 6 : 10;
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(700px) rotateY(${x * s}deg) rotateX(${-y * s}deg) translateY(-8px) scale(1.01)`;
        el.style.transition = 'transform .15s ease';
      };
      const leave = () => {
        el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
        el.style.transform = 'perspective(700px) rotateY(0) rotateX(0) translateY(0) scale(1)';
      };
      el.addEventListener('mousemove', move as EventListener);
      el.addEventListener('mouseleave', leave as EventListener);
      handlers.set(el, { move, leave });
    });
    return () => {
      handlers.forEach(({ move, leave }, el) => {
        el.removeEventListener('mousemove', move as EventListener);
        el.removeEventListener('mouseleave', leave as EventListener);
      });
    };
  }, []);

  return (
    <>
      <div className="page-grad" />
      <div className="float-icons">
        <span className="fi fi1">💰</span><span className="fi fi2">📊</span>
        <span className="fi fi3">🧾</span><span className="fi fi4">📈</span>
      </div>
      <Navbar variant="full" />

      {/* HERO */}
      <div style={{ position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div className="hero-mesh">
          <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /><div className="orb orb4" />
        </div>
        <div className="hero">
          <div>
            <div className="hero-label rev-l"><span className="hero-label-line" />PLATFORM KALKULATOR KEUANGAN INDONESIA</div>
            <h1 className="rev-l d1">Semua Kebutuhan<br />Keuangan Kamu<br /><span className="hl">di Satu Tempat</span></h1>
            <p className="hero-sub rev-l d2">Hitung cicilan KPR, buat invoice profesional, hitung pajak — gratis, tanpa daftar, langsung pakai.</p>
            <div className="hero-btns rev-l d3">
              <Link href="/tools" className="btn-p">Coba Tools Sekarang</Link>
              <Link href="/blog" className="btn-g">Baca Blog →</Link>
              <a href="#sec-tools" className="btn-scroll">Lihat 24 Tools ↓</a>
            </div>
          </div>
          <div className="hero-right">
            <div className="illus-wrap">
              <div className="illus-glow" />
              <div className="ring ring1">
                <div className="rdot" style={{ background: 'var(--teal)', boxShadow: '0 0 6px rgba(22,163,74,.5)', transform: 'rotate(0deg) translateX(105px)' }} />
                <div className="rdot" style={{ background: '#1B3C53', boxShadow: '0 0 6px rgba(27,60,83,.5)', transform: 'rotate(72deg) translateX(105px)' }} />
                <div className="rdot" style={{ background: 'var(--teal)', transform: 'rotate(144deg) translateX(105px)' }} />
                <div className="rdot" style={{ background: '#1B3C53', transform: 'rotate(216deg) translateX(105px)' }} />
                <div className="rdot" style={{ background: 'var(--teal)', transform: 'rotate(288deg) translateX(105px)' }} />
              </div>
              <div className="ring ring2">
                <div className="rdot" style={{ width: 4, height: 4, margin: -2, background: '#2DD4BF', transform: 'rotate(45deg) translateX(79px)' }} />
                <div className="rdot" style={{ width: 4, height: 4, margin: -2, background: '#547792', transform: 'rotate(165deg) translateX(79px)' }} />
                <div className="rdot" style={{ width: 4, height: 4, margin: -2, background: '#2DD4BF', transform: 'rotate(285deg) translateX(79px)' }} />
              </div>
              {/* Character SVG */}
              <svg className="char-svg" viewBox="0 0 240 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bShine" x1="72" y1="144" x2="168" y2="186" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fff" stopOpacity=".35"/><stop offset="100%" stopColor="#fff" stopOpacity="0"/>
                  </linearGradient>
                  <radialGradient id="hShine" cx="34%" cy="28%" r="60%">
                    <stop offset="0%" stopColor="#fff" stopOpacity=".09"/><stop offset="100%" stopColor="#fff" stopOpacity="0"/>
                  </radialGradient>
                  <linearGradient id="tabGrad" x1="176" y1="158" x2="228" y2="198" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1B3C53" stopOpacity=".95"/><stop offset="100%" stopColor="#061E29"/>
                  </linearGradient>
                </defs>
                <ellipse cx="120" cy="332" rx="65" ry="7" fill="rgba(27,60,83,.07)"/>
                <rect x="88" y="248" width="22" height="62" rx="11" fill="#213448"/><rect x="130" y="248" width="22" height="62" rx="11" fill="#213448"/>
                <rect x="80" y="300" width="36" height="18" rx="9" fill="#0F172A"/><rect x="122" y="300" width="36" height="18" rx="9" fill="#0F172A"/>
                <rect x="84" y="302" width="16" height="4" rx="2" fill="rgba(255,255,255,.1)"/><rect x="126" y="302" width="16" height="4" rx="2" fill="rgba(255,255,255,.1)"/>
                <rect x="72" y="144" width="96" height="112" rx="22" fill="#1B3C53"/>
                <rect x="72" y="144" width="96" height="42" rx="22" fill="url(#bShine)" opacity=".18"/>
                <path d="M100 144 L120 168 L140 144" stroke="rgba(255,255,255,.14)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="36" y="152" width="40" height="20" rx="10" fill="#213448" transform="rotate(-12 36 152)"/>
                <circle cx="32" cy="188" r="13" fill="#213448"/><circle cx="32" cy="188" r="6" fill="#296374"/>
                <rect x="164" y="148" width="40" height="20" rx="10" fill="#213448" transform="rotate(12 164 148)"/>
                <rect x="176" y="158" width="52" height="40" rx="9" fill="url(#tabGrad)"/>
                <rect x="183" y="181" width="6" height="12" rx="2" fill="#0D9488" opacity=".9"/>
                <rect x="193" y="174" width="6" height="19" rx="2" fill="#14B8A6" opacity=".9"/>
                <rect x="203" y="177" width="6" height="16" rx="2" fill="#0D9488" opacity=".9"/>
                <rect x="213" y="170" width="6" height="23" rx="2" fill="#2DD4BF" opacity=".9"/>
                <polyline points="183,181 193,174 203,175 213,170" stroke="#2DD4BF" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="182" y="163" width="30" height="4" rx="2" fill="rgba(255,255,255,.15)"/>
                <rect x="108" y="124" width="24" height="26" rx="8" fill="#1B3C53"/>
                <circle cx="120" cy="98" r="47" fill="#1B3C53"/>
                <circle cx="120" cy="98" r="47" fill="url(#hShine)"/>
                <circle cx="104" cy="94" r="7.5" fill="#0F172A"/><circle cx="136" cy="94" r="7.5" fill="#0F172A"/>
                <circle cx="106" cy="92" r="2.5" fill="rgba(255,255,255,.5)"/><circle cx="138" cy="92" r="2.5" fill="rgba(255,255,255,.5)"/>
                <circle cx="104" cy="94" r="4" fill="#14B8A6"/><circle cx="136" cy="94" r="4" fill="#14B8A6"/>
                <path d="M108 111 Q120 122 132 111" stroke="rgba(255,255,255,.22)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <rect x="82" y="58" width="12" height="12" rx="2" fill="#0D9488" opacity=".7" transform="rotate(45 88 64)"/>
                <circle cx="157" cy="66" r="7" fill="#14B8A6" opacity=".45"/>
                <circle cx="74" cy="98" r="4" fill="#296374" opacity=".6"/>
                <circle cx="50" cy="118" r="17" fill="#F0FDF4" stroke="#0D9488" strokeWidth="1.5">
                  <animate attributeName="cy" values="118;109;118" dur="3.2s" repeatCount="indefinite"/>
                </circle>
                <text x="50" y="124" textAnchor="middle" fontSize="14" fill="#0D9488" fontWeight="700">$</text>
                <rect x="170" y="64" width="46" height="28" rx="8" fill="#1B3C53">
                  <animate attributeName="y" values="64;56;64" dur="4s" repeatCount="indefinite"/>
                </rect>
                <text x="193" y="83" textAnchor="middle" fontSize="11" fill="#2DD4BF" fontWeight="700" fontFamily="monospace">7.5%</text>
                <g opacity=".65">
                  <animate attributeName="opacity" values=".65;.95;.65" dur="3s" repeatCount="indefinite"/>
                  <rect x="26" y="212" width="30" height="22" rx="6" fill="#213448"/>
                  <polyline points="31,226 37,219 43,222 49,215" stroke="#14B8A6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </svg>
              <div className={`ibadge ib1${slideIdx % 2 === 0 ? '' : ' hidden'}`}><span className="ib-icon">{demoSlides[slideIdx].icon}</span><div><div className="ib-label">{demoSlides[slideIdx].label}</div><div className="ib-val">{demoSlides[slideIdx].line1}</div></div></div>
              <div className={`ibadge ib2${slideIdx % 2 !== 0 ? '' : ' hidden'}`}><span className="ib-icon">{demoSlides[(slideIdx + 1) % demoSlides.length].icon}</span><div><div className="ib-label">{demoSlides[(slideIdx + 1) % demoSlides.length].label}</div><div className="ib-sub">{demoSlides[(slideIdx + 1) % demoSlides.length].line2}</div></div></div>
              <div className="ibadge ib3"><div style={{ textAlign: 'center' }}><div className="ib-mono">Tools</div><div className="ib-big">24</div></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave 1 */}
      <div className="wave">
        <svg viewBox="0 0 1440 52" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" height="52">
          <path d="M0,26 C240,52 480,0 720,26 C960,52 1200,0 1440,26 L1440,52 L0,52 Z" fill="rgba(27,60,83,.04)"/>
          <path d="M0,36 C360,8 720,52 1080,26 C1260,14 1380,42 1440,36 L1440,52 L0,52 Z" fill="rgba(22,163,74,.03)"/>
        </svg>
      </div>

      {/* STATS */}
      <div className="stats-wrap" id="statsWrap" style={{ display: 'none' }}>
        <div className="stats-grid">
          <div className="stat-card reveal d1">
            <div className="stat-top"><div className="flip-wrap"><div className="flip-reel" id="fr1"><div className="flip-digit">0</div></div></div><div className="stat-unit">tools</div></div>
            <div className="stat-name">Tools keuangan tersedia</div>
            <div className="stat-bar"><div className="stat-fill fill-g" id="b1" /></div>
            <div className="stat-note">Gratis selamanya · No signup</div>
          </div>
          <div className="stat-card reveal d2">
            <div className="stat-top"><div className="flip-wrap"><div className="flip-reel" id="fr2"><div className="flip-digit">0</div></div></div><div className="stat-unit">users</div></div>
            <div className="stat-name">Pengguna aktif per bulan</div>
            <div className="stat-bar"><div className="stat-fill fill-b" id="b2" /></div>
            <div className="stat-note">Dan terus bertumbuh</div>
          </div>
          <div className="stat-card reveal d3">
            <div className="stat-top"><div className="flip-wrap"><div className="flip-reel" id="fr3"><div className="flip-digit">0</div></div></div><div className="stat-unit">kalkulasi</div></div>
            <div className="stat-name">Total kalkulasi selesai</div>
            <div className="stat-bar"><div className="stat-fill fill-t" id="b3" /></div>
            <div className="stat-note">Akurat · Sesuai regulasi 2025</div>
          </div>
        </div>
      </div>

      {/* TOOLS */}
      <div className="section" id="sec-tools">
        <div className="eyebrow reveal">Semua Tools</div>
        <div className="sec-title reveal d1">Tools Keuangan <span className="hl-grad">Terlengkap</span></div>
        <div className="sec-sub reveal d2">24 tools siap pakai — gratis, akurat, tanpa daftar</div>
        <div ref={cardsRef}>
          {categoryOrder.map(cat => {
            const items = grouped[cat];
            if (!items) return null;
            return (
              <div key={cat} className="cat-section reveal">
                <div className="cat-header">
                  <span className="cat-title">{cat}</span>
                  <span className="cat-badge">{items.length} tools</span>
                </div>
                <div className="tools-grid">
                  {items.map((t, i) => (
                    <Link key={t.slug} href={t.href} className={`tool-card reveal d${(i % 4) + 1}`}>
                      <div className="card-icon-area">
                        <div className="card-icon-wrap">{t.icon}</div>
                        {t.badge?.type === 'hot' && <div className="card-badge-dot">🔥</div>}
                      </div>
                      <div className="card-name">{t.name}</div>
                      <div className="card-desc">{t.description}</div>
                      <div className="card-arrow">↗</div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TICKER */}
      <div className="ticker-outer">
        <div className="ticker-track">
          {[...Array(2)].map((_, r) => (
            <span key={r} style={{ display: 'contents' }}>
              <div className="ticker-item"><span className="ticker-dot" /><span className="ticker-label">Blog Baru</span>Cara Hitung Cicilan KPR yang Benar di 2025</div>
              <div className="ticker-item"><span className="ticker-dot" /><span className="ticker-label">Tips</span>5 Strategi Investasi untuk Pemula dengan Modal Kecil</div>
              <div className="ticker-item"><span className="ticker-dot" /><span className="ticker-label">Panduan</span>PPh 21 Terbaru: Tarif dan Cara Hitungnya</div>
              <div className="ticker-item"><span className="ticker-dot" /><span className="ticker-label">Update</span>BPJS Kesehatan 2025: Iuran dan Manfaat Terbaru</div>
              <div className="ticker-item"><span className="ticker-dot" /><span className="ticker-label">Tips</span>Buat Invoice Profesional Tanpa Software Berbayar</div>
            </span>
          ))}
        </div>
      </div>

      {/* WHY */}
      <div className="section" id="sec-why">
        <div className="eyebrow reveal">Kenapa Kalkunesia?</div>
        <div className="sec-title reveal d1">Dibuat untuk <span className="hl-grad">Kemudahan Kamu</span></div>
        <div className="why-grid">
          <div className="why-card reveal d1"><div className="why-icon">⚡</div><div className="why-title">Instan &amp; Akurat</div><div className="why-desc">Kalkulasi real-time langsung di browser. Tidak perlu install apapun, tidak perlu daftar.</div></div>
          <div className="why-card reveal d2"><div className="why-icon">🔒</div><div className="why-title">Data Kamu Aman</div><div className="why-desc">Semua perhitungan diproses di perangkat kamu. Data tidak pernah dikirim ke server kami.</div></div>
          <div className="why-card reveal d3"><div className="why-icon">🎯</div><div className="why-title">Sesuai Regulasi 2025</div><div className="why-desc">Tarif pajak, iuran BPJS, dan peraturan keuangan selalu diperbarui mengikuti regulasi terkini.</div></div>
        </div>
      </div>

      {/* Wave 2 */}
      <div className="wave">
        <svg viewBox="0 0 1440 52" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" height="52">
          <path d="M0,18 C360,52 720,0 1080,34 C1260,50 1380,14 1440,18 L1440,52 L0,52 Z" fill="#1B3C53" opacity=".07"/>
          <path d="M0,34 C240,8 600,50 960,26 C1200,10 1380,46 1440,34 L1440,52 L0,52 Z" fill="#1B3C53" opacity=".05"/>
        </svg>
      </div>

      {/* SOCIAL PROOF */}
      <div className="section" id="sec-social">
        <div className="eyebrow reveal">Dipercaya Pengguna</div>
        <div className="sec-title reveal d1">Apa Kata <span className="hl-grad">Mereka?</span></div>
        <div className="testimonial-grid">
          {[
            { name: 'Rizky A.', role: 'Karyawan Swasta', text: 'Akhirnya ada tools PPh 21 yang mudah dipahami. Langsung tahu take home pay saya setelah potongan.', avatar: '👨‍💼' },
            { name: 'Sari W.', role: 'Pemilik UMKM', text: 'Invoice generator-nya keren banget, bisa langsung export PDF. Hemat waktu banget buat billing klien.', avatar: '👩‍💻' },
            { name: 'Budi S.', role: 'Fresh Graduate', text: 'Kalkulator KPR-nya detail banget, ada tabel amortisasi lengkap. Bantu banget untuk planning beli rumah pertama.', avatar: '🏠' },
            { name: 'Maya R.', role: 'Freelancer', text: 'Budget planner 50/30/20 simpel tapi efektif. Sekarang pengeluaran saya lebih terkontrol.', avatar: '💼' },
          ].map((t, i) => (
            <div key={i} className={`testimonial-card reveal d${(i%4)+1}`}>
              <div className="testimonial-text">&ldquo;{t.text}&rdquo;</div>
              <div className="testimonial-author">
                <span className="testimonial-avatar">{t.avatar}</span>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CLOSING CTA */}
      <div className="section sec-cta-bottom">
        <div className="cta-bottom-card reveal">
          <div className="cta-bottom-badge">🚀 Gratis Selamanya</div>
          <div className="cta-bottom-title">Mulai Kelola Keuangan Kamu <span className="hl-grad">Sekarang</span></div>
          <div className="cta-bottom-sub">24 tools keuangan, tanpa biaya, tanpa daftar. Langsung pakai.</div>
          <div className="cta-bottom-actions">
            <a href="/tools" className="btn-p">Coba Semua Tools →</a>
            <a href="/sign-up" className="btn-ghost">Daftar Gratis</a>
          </div>
        </div>
      </div>

      <FooterFull />
    </>
  );
}

function flipCounter(reelId: string, target: number, fmt: string) {
  setTimeout(() => {
    const reel = document.getElementById(reelId);
    if (!reel) return;
    const S = 20, H = 40;
    const vals: string[] = [];
    for (let i = 0; i <= S; i++) {
      const p = 1 - Math.pow(1 - i / S, 3);
      const v = Math.floor(p * target);
      if (fmt === 'K') vals.push(v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v + '');
      else if (fmt === 'M') vals.push(v >= 1000000 ? (v / 1000000).toFixed(1) + 'jt' : v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v + '');
      else vals.push(v + (fmt || ''));
    }
    reel.innerHTML = vals.map(v => `<div class="flip-digit">${v}</div>`).join('');
    reel.style.transition = 'transform 1.5s cubic-bezier(.16,1,.3,1)';
    reel.style.transform = `translateY(-${S * H}px)`;
  }, 400);
}
