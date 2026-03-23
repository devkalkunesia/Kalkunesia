import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FooterSimple } from '@/components/Footer';
import { getAllArticles } from '@/lib/blog';

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await getAllArticles();

  return (
    <>
      <Navbar variant="simple" />
      <div className="breadcrumb"><div className="bc-inner"><a className="bc-link" href="/">Home</a><span className="bc-sep">›</span><span>Blog</span></div></div>

      <div className="tool-hero reveal">
        <div className="tool-hero-inner">
          <div className="tool-hero-icon">📝</div>
          <div><div className="tool-hero-badge">📖 Artikel Keuangan</div><h1>Blog Kalkunesia</h1></div>
        </div>
        <p className="tool-hero-sub">Tips keuangan, panduan investasi, dan informasi pajak terkini untuk membantu kamu mengambil keputusan finansial yang lebih cerdas.</p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 60px 80px', position: 'relative', zIndex: 1 }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Blog Segera Hadir</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, maxWidth: 420, margin: '0 auto' }}>
              Kami sedang menyiapkan artikel-artikel berkualitas tentang keuangan,
              pajak, dan investasi di Indonesia.
            </p>
            <Link href="/tools" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24,
              background: 'linear-gradient(135deg,var(--navy),var(--navy2))', color: '#fff',
              border: 'none', borderRadius: 14, padding: '14px 28px', fontSize: 14, fontWeight: 700,
              textDecoration: 'none',
            }}>
              🔧 Coba Tools Gratis Kami
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                style={{
                  display: 'block', textDecoration: 'none',
                  background: 'rgba(255,255,255,.75)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,.95)', borderRadius: 20,
                  padding: 28, boxShadow: '0 4px 16px rgba(27,60,83,.06)',
                  transition: 'all .3s cubic-bezier(.16,1,.3,1)',
                }}
              >
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 8 }}>
                      {post.excerpt}
                    </p>
                  )}
                  <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: 11, color: 'var(--muted)' }}>
                    {post.publish_date
                      ? new Date(post.publish_date).toLocaleDateString('id-ID', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })
                      : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <FooterSimple />
    </>
  );
}
