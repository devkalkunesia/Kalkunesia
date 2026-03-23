'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton } from '@clerk/react';
import AuthModal from './AuthModal';
import './Navbar.css';

interface NavbarProps {
  variant?: 'full' | 'simple';
}

const megaCategories = [
  {
    title: 'Pajak & Gaji',
    icon: '💼',
    items: [
      { icon: '📋', name: 'PPh 21',       desc: 'Pajak penghasilan 2025',     href: '/tools/pph-21' },
      { icon: '💰', name: 'Kalkulator Gaji', desc: 'Take home pay',           href: '/tools/gaji' },
      { icon: '🛡️', name: 'BPJS',          desc: 'Iuran BPJS',               href: '/tools/bpjs' },
      { icon: '🏢', name: 'PPh 25/Badan',  desc: 'Angsuran PPh 25',           href: '/tools/pph-25' },
      { icon: '🧾', name: 'Kalkulator PPN', desc: 'PPN 11% & 12%',           href: '/tools/ppn' },
      { icon: '🏪', name: 'PPh UMKM',      desc: 'Pajak 0.5% omzet',         href: '/tools/pph-umkm' },
    ],
  },
  {
    title: 'Kredit & Properti',
    icon: '🏠',
    items: [
      { icon: '🏠', name: 'KPR Calculator', desc: 'Cicilan & amortisasi',     href: '/tools/kpr' },
      { icon: '🏠', name: 'BPHTB',         desc: 'Pajak beli properti',       href: '/tools/bphtb' },
    ],
  },
  {
    title: 'Investasi',
    icon: '📈',
    items: [
      { icon: '📈', name: 'ROI Calculator', desc: 'Return on investment',     href: '/tools/roi' },
      { icon: '💹', name: 'Compound Interest', desc: 'Bunga berbunga',        href: '/tools/compound' },
      { icon: '📈', name: 'Kalkulator Saham', desc: 'Fee & profit saham',     href: '/tools/saham' },
      { icon: '💼', name: 'Reksa Dana',     desc: 'Simulasi reksa dana',      href: '/tools/reksa-dana' },
      { icon: '👴', name: 'Dana Pensiun',   desc: 'Perencanaan pensiun',      href: '/tools/dana-pensiun' },
      { icon: '📉', name: 'Kalkulator Inflasi', desc: 'Dampak inflasi',       href: '/tools/inflasi' },
    ],
  },
  {
    title: 'Bisnis & UMKM',
    icon: '🏪',
    items: [
      { icon: '🧾', name: 'Invoice Generator', desc: 'Invoice PDF gratis',    href: '/tools/invoice' },
      { icon: '📊', name: 'Budget Planner', desc: 'Anggaran 50/30/20',        href: '/tools/budget' },
      { icon: '📊', name: 'Kalkulator BEP', desc: 'Break even point',         href: '/tools/bep' },
      { icon: '💰', name: 'Harga Jual',     desc: 'HPP & margin',             href: '/tools/harga-jual' },
      { icon: '🤝', name: 'Komisi Sales',   desc: 'Flat & tiered',            href: '/tools/komisi' },
    ],
  },
  {
    title: 'Perencanaan',
    icon: '🎯',
    items: [
      { icon: '🛡️', name: 'Dana Darurat',   desc: 'Target dana darurat',     href: '/tools/dana-darurat' },
      { icon: '🎯', name: 'Tabungan Tujuan', desc: 'Target tabungan',         href: '/tools/tabungan-tujuan' },
      { icon: '💎', name: 'Net Worth',      desc: 'Kekayaan bersih',          href: '/tools/net-worth' },
      { icon: '☪️', name: 'Kalkulator Zakat', desc: 'Maal, penghasilan, fitrah', href: '/tools/zakat' },
    ],
  },
  {
    title: 'Keuangan Global',
    icon: '🌐',
    items: [
      { icon: '💱', name: 'Currency Converter', desc: 'Kurs rupiah real-time', href: '/tools/currency' },
    ],
  },
];

export default function Navbar({ variant = 'full' }: NavbarProps) {
  const navRef = useRef<HTMLElement>(null);
  const [showAuth, setShowAuth] = useState(false);
  const lastY = useRef(0);
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  // Scroll listener — scrolled state + nav-hidden
  useEffect(() => {
    const scrolledEnter = 80;
    const scrolledExit = 30;
    const hiddenEnterY = 220;
    const hiddenExitY = 170;
    const hideDelta = 10;
    const showDelta = 10;
    let ticking = false;
    let rafId = 0;

    const handler = () => {
      if (ticking) return;

      ticking = true;
      rafId = window.requestAnimationFrame(() => {
        const nav = navRef.current;
        if (!nav) {
          ticking = false;
          return;
        }

        const y = window.scrollY;
        const delta = y - lastY.current;
        const isScrolled = nav.classList.contains('scrolled');
        const isHidden = nav.classList.contains('nav-hidden');

        if (!isScrolled && y > scrolledEnter) {
          nav.classList.add('scrolled');
        } else if (isScrolled && y < scrolledExit) {
          nav.classList.remove('scrolled');
        }

        if (!isHidden && y > hiddenEnterY && delta > hideDelta) {
          nav.classList.add('nav-hidden');
        } else if (isHidden && (y < hiddenExitY || delta < -showDelta)) {
          nav.classList.remove('nav-hidden');
        }

        lastY.current = y;
        ticking = false;
      });
    };

    lastY.current = window.scrollY;
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => {
      window.removeEventListener('scroll', handler);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Logo click → scroll ke atas dengan smooth
  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav ref={navRef} className="nav-outer">

      {/* ── LOGO PILL (kiri) — klik scroll to top ── */}
      <button type="button" className="logo-pill" onClick={handleLogoClick} aria-label="Kembali ke atas">
        <div className="logo-mark">🧮</div>
        <span className="logo-name">Kalku<em>nesia</em></span>
      </button>

      {/* ── HOME PILL (standalone, visible on all variants) ── */}
      {pathname !== '/' && (
        <Link href="/" className="home-pill">← Home</Link>
      )}

      {/* ── LINKS PILL (tengah, absolute) ── */}
      {variant === 'full' && (
        <div className="links-pill">
          {megaCategories.map(cat => (
            <div key={cat.title} className="nav-item">
              <button type="button" className="nav-link">
                <span className="nl-icon">{cat.icon}</span>
                {cat.title}
                <span className="nl-arrow">▾</span>
              </button>
              <div className="cat-dropdown">
                {cat.items.map(t => (
                  <Link key={t.href} href={t.href} className="cat-drop-item">
                    <span className="cat-drop-icon">{t.icon}</span>
                    <span className="cat-drop-name">{t.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="nav-sep" />
          <Link href="/blog" className="nav-link">📝 Blog</Link>
          <button type="button" className="nav-link">Tentang</button>
        </div>
      )}

      {/* ── SPACER ── */}
      <div className="nav-spacer" />

      {/* ── USER BUTTON / CTA PILL (kanan) ── */}
      {isSignedIn ? (
        <>
          <Link href="/dashboard" className="nav-cta">
            <span className="cta-label">Simpan History</span>
          </Link>
          <div className="nav-user-btn">
            <UserButton
              userProfileUrl="/dashboard"
              appearance={{
                elements: { avatarBox: 'nav-avatar-box' }
              }}
            />
          </div>
        </>
      ) : (
        <>
          <button type="button" className="nav-cta" onClick={() => setShowAuth(true)}>
            <span className="cta-label">Login & Simpan</span>
          </button>
          <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
        </>
      )}

    </nav>
  );
}
