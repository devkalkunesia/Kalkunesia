'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FooterSimple } from '@/components/Footer';
import { useScrollReveal, useBackToTop } from '@/lib/hooks';
import { tools, ToolInfo } from '@/lib/tools-data';

const categoryOrder = ['Pajak & Gaji', 'Investasi', 'Bisnis & Keuangan', 'Perencanaan', 'Kredit & Properti', 'Keuangan Syariah', 'Ekonomi'];
const grouped: Record<string, ToolInfo[]> = tools.reduce((acc, t) => { (acc[t.category] = acc[t.category] || []).push(t); return acc; }, {} as Record<string, ToolInfo[]>);

const badgeMap: Record<string, { text: string; className: string }> = {
  kpr: { text: '🔥 HOT', className: 'badge-hot' },
  'pph-21': { text: '🔥 HOT', className: 'badge-hot' },
  gaji: { text: '🔥 HOT', className: 'badge-hot' },
  bpjs: { text: '✅ CORE', className: 'badge-core' },
  invoice: { text: '🔥 HOT', className: 'badge-hot' },
  budget: { text: '💡 POPULER', className: 'badge-core' },
};

function getBadge(t: ToolInfo) {
  return badgeMap[t.slug] || (t.badge ? { text: t.badge.text, className: 'badge-new' } : null);
}

function ToolCard({ t }: { t: ToolInfo }) {
  const badge = getBadge(t);
  return (
    <Link className="ti-tool-card reveal" href={t.href}>
      <div className="ti-tool-top"><div className="ti-tool-icon">{t.icon}</div>{badge && <span className={`ti-badge ${badge.className}`}>{badge.text}</span>}</div>
      <div className="ti-tool-name">{t.name}</div>
      <div className="ti-tool-desc">{t.description}</div>
      <span className="ti-tool-arrow">→</span>
    </Link>
  );
}

export default function ToolsIndexPage() {
  const [query, setQuery] = useState('');
  useScrollReveal();
  useBackToTop();

  const q = query.toLowerCase();
  const hasQuery = q.length > 0;
  const filtered = hasQuery
    ? tools.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.slug.includes(q))
    : [];

  return (
    <>
      <Navbar variant="simple" />
      <div className="ti-hero reveal">
        <div className="ti-eyebrow">🇮🇩 Platform Keuangan Indonesia</div>
        <h1>Semua <em>Tools</em><br />Keuangan Kamu</h1>
        <p className="ti-sub">24 kalkulator keuangan gratis. Akurat, cepat, tanpa daftar. Untuk karyawan, freelancer, dan pemilik usaha.</p>
        <div className="ti-stats">
          <div className="ti-stat"><div className="ti-stat-num">24</div><div className="ti-stat-label">Tools Gratis</div></div>
          <div className="ti-stat"><div className="ti-stat-num">0</div><div className="ti-stat-label">Biaya Langganan</div></div>
          <div className="ti-stat"><div className="ti-stat-num">2025</div><div className="ti-stat-label">Data Terkini</div></div>
        </div>
      </div>

      <div className="ti-search reveal">
        <input type="text" className="ti-search-input" placeholder="🔍  Cari kalkulator... (KPR, pajak, gaji, investasi...)" value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div className="ti-main">
        {hasQuery ? (
          <>
            <div className="ti-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filtered.map(t => <ToolCard key={t.slug} t={t} />)}
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Tidak ada tools yang cocok dengan &quot;{query}&quot;</div>
              </div>
            )}
          </>
        ) : (
          categoryOrder.map(cat => {
            const items = grouped[cat];
            if (!items) return null;
            return (
              <div key={cat} className="ti-cat-section">
                <div className="ti-cat-header reveal">
                  <span className="ti-cat-title">{cat}</span>
                  <span className="ti-cat-badge">{items.length} tools</span>
                </div>
                <div className="ti-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {items.map(t => <ToolCard key={t.slug} t={t} />)}
                </div>
              </div>
            );
          })
        )}
      </div>
      <FooterSimple />
    </>
  );
}
