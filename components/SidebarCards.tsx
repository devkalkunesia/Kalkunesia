import Link from 'next/link';

interface TipItem { icon: string; text: string; }
interface RelatedItem { icon: string; name: string; desc: string; href: string; }

export function TipsCard({ title, items }: { title: string; items: TipItem[] }) {
  return (
    <div className="tips-card reveal">
      <div className="tips-header">{title}</div>
      {items.map((tip, i) => (
        <div key={i} className="tips-item">
          <div className="tips-icon">{tip.icon}</div>
          <div className="tips-text">{tip.text}</div>
        </div>
      ))}
    </div>
  );
}

export function RelatedToolsCard({ items }: { items: RelatedItem[] }) {
  return (
    <div className="related-card reveal">
      <div className="related-title">🔧 Tools Terkait</div>
      {items.map((item, i) => (
        <Link key={i} className="related-item" href={item.href}>
          <div className="related-icon">{item.icon}</div>
          <div><div className="related-name">{item.name}</div><div className="related-desc">{item.desc}</div></div>
        </Link>
      ))}
    </div>
  );
}

interface BlogPost { title: string; category: string; readTime: string; slug: string; }

export function BlogCard({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="blog-sidebar-card reveal">
      <div className="blog-sidebar-title">📝 Artikel Terkait</div>
      {posts.map((post, i) => (
        <Link key={i} className="blog-sidebar-item" href={`/blog/${post.slug}`}>
          <div className="blog-sidebar-meta">
            <span className="blog-sidebar-cat">{post.category}</span>
            <span className="blog-sidebar-time">{post.readTime}</span>
          </div>
          <div className="blog-sidebar-post-title">{post.title}</div>
        </Link>
      ))}
      <Link href="/blog" className="blog-sidebar-all">Lihat semua artikel →</Link>
    </div>
  );
}

interface KamusTerm { term: string; def: string; }

export function KamusCard({ terms }: { terms: KamusTerm[] }) {
  return (
    <div className="kamus-card reveal">
      <div className="kamus-title">📖 Kamus Keuangan</div>
      {terms.map((t, i) => (
        <div key={i} className="kamus-item">
          <div className="kamus-term">{t.term}</div>
          <div className="kamus-def">{t.def}</div>
        </div>
      ))}
    </div>
  );
}
