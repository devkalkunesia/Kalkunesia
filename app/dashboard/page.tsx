'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUser, useAuth, SignIn } from '@clerk/react';
import Navbar from '@/components/Navbar';
import { getHistory, deleteHistory, buildToolUrl, type HistoryRecord } from '@/lib/history';
import { formatRupiah } from '@/lib/utils';
import './dashboard.css';

const TOOL_ICONS: Record<string, string> = {
  kpr: '🏠', 'pph-21': '📋', bpjs: '🛡️', gaji: '💰',
  roi: '📈', compound: '💹', budget: '📊', 'pph-25': '🏢',
  invoice: '🧾', currency: '💱',
};

const TOOL_FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'kpr', label: 'KPR' },
  { id: 'pph-21', label: 'PPh 21' },
  { id: 'bpjs', label: 'BPJS' },
  { id: 'gaji', label: 'Gaji' },
  { id: 'roi', label: 'ROI' },
  { id: 'compound', label: 'Compound' },
  { id: 'budget', label: 'Budget' },
  { id: 'pph-25', label: 'PPh 25' },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getResultSummary(record: HistoryRecord): string {
  const r = record.result;
  switch (record.tool_id) {
    case 'kpr':
      return r.cicilan ? `Cicilan ${formatRupiah(r.cicilan as number)}/bln` : '';
    case 'pph-21':
      return r.thp ? `THP ${formatRupiah(r.thp as number)}/bln` : '';
    case 'bpjs':
      return r.totalKary ? `Potongan ${formatRupiah(r.totalKary as number)}/bln` : '';
    case 'gaji':
      return r.thp ? `THP ${formatRupiah(r.thp as number)}` : '';
    case 'roi':
      return r.roi ? `ROI ${(r.roi as number).toFixed(1)}%` : '';
    case 'compound':
      return r.finalVal ? `Nilai Akhir ${formatRupiah(r.finalVal as number)}` : '';
    case 'budget':
      return r.sisa !== undefined ? `Sisa ${formatRupiah(r.sisa as number)}` : '';
    case 'pph-25':
      return r.angsuran ? `Angsuran ${formatRupiah(r.angsuran as number)}/bln` : '';
    case 'invoice':
      return r.total ? `Total ${formatRupiah(r.total as number)}` : '';
    default:
      return '';
  }
}

export default function DashboardPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    const { data } = await getHistory(user.id, token);
    setHistory(data);
    setLoading(false);
  }, [user?.id, getToken]);

  useEffect(() => {
    if (isSignedIn && user?.id) fetchHistory();
  }, [isSignedIn, user?.id, fetchHistory]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus history ini?')) return;
    const token = await getToken();
    if (!token) return;
    setDeleting(id);
    await deleteHistory(id, token);
    setHistory(prev => prev.filter(h => h.id !== id));
    setDeleting(null);
  };

  const filtered = filter === 'all' ? history : history.filter(h => h.tool_id === filter);

  return (
    <>
      <Navbar variant="simple" />

      <main className="dash-main">
        {!isLoaded ? (
          <div className="dash-loading">
            <div className="dash-spinner" />
            <p>Memuat...</p>
          </div>
        ) : isSignedIn ? (
          <div className="dash-content">
            {/* Header */}
            <div className="dash-header">
              <div>
                <h1 className="dash-title">History Kalkulasi</h1>
                <p className="dash-subtitle">Halo, {user?.firstName ?? 'User'} — lihat semua kalkulasi yang sudah kamu simpan</p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="dash-filters">
              {TOOL_FILTERS.map(f => (
                <button
                  key={f.id}
                  className={`dash-filter-btn${filter === f.id ? ' active' : ''}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.id !== 'all' && TOOL_ICONS[f.id]} {f.label}
                  {f.id !== 'all' && (
                    <span className="dash-filter-count">
                      {history.filter(h => h.tool_id === f.id).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            {loading ? (
              <div className="dash-skeleton-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="dash-skeleton-card">
                    <div className="skel-line skel-short" />
                    <div className="skel-line skel-long" />
                    <div className="skel-line skel-medium" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="dash-empty">
                <div className="dash-empty-icon">📭</div>
                <h3 className="dash-empty-title">
                  {filter === 'all' ? 'Belum ada history' : `Belum ada history ${TOOL_FILTERS.find(f => f.id === filter)?.label}`}
                </h3>
                <p className="dash-empty-desc">
                  Mulai gunakan kalkulator dan simpan hasil kalkulasi kamu
                </p>
                <Link href="/tools" className="dash-empty-cta">
                  Jelajahi Tools →
                </Link>
              </div>
            ) : (
              <div className="dash-grid">
                {filtered.map(record => (
                  <div key={record.id} className="hcard">
                    <div className="hcard-top">
                      <div className="hcard-icon">{TOOL_ICONS[record.tool_id] ?? '🧮'}</div>
                      <div className="hcard-tool">{record.tool_name}</div>
                      <div className="hcard-date">{formatDate(record.created_at)}</div>
                    </div>
                    <div className="hcard-label">{record.label}</div>
                    <div className="hcard-result">{getResultSummary(record)}</div>
                    <div className="hcard-actions">
                      <Link href={buildToolUrl(record)} className="hcard-btn open">
                        🔄 Buka Lagi
                      </Link>
                      <button
                        className="hcard-btn delete"
                        onClick={() => handleDelete(record.id)}
                        disabled={deleting === record.id}
                      >
                        {deleting === record.id ? '...' : '🗑️ Hapus'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="dash-guest">
            <div className="dash-guest-icon">🔐</div>
            <h1 className="dash-guest-title">Silakan Login</h1>
            <p className="dash-guest-desc">
              Login untuk melihat history kalkulasi kamu
            </p>
            <div className="dash-signin-wrap">
              <SignIn
                routing="hash"
                forceRedirectUrl="/dashboard"
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
