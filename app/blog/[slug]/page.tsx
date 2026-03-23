import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { FooterSimple } from '@/components/Footer';
import { getAllArticles, getArticleBySlug } from '@/lib/blog';

const FALLBACK_SLUG = 'artikel-contoh';

export const revalidate = 3600;
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const articles = await getAllArticles();
  if (articles.length === 0) {
    return [{ slug: FALLBACK_SLUG }];
  }
  return articles.map(article => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    if (slug === FALLBACK_SLUG) {
      return {
        title: 'Artikel Kalkunesia',
        description: 'Konten blog akan muncul otomatis setelah artikel aktif tersedia di database.',
      };
    }
    return {};
  }
  return {
    title: article.meta_title ?? article.title,
    description: article.meta_description ?? article.excerpt ?? '',
    ...(article.canonical_url ? { alternates: { canonical: article.canonical_url } } : {}),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const fetchedArticle = await getArticleBySlug(slug);
  const article = fetchedArticle ?? (slug === FALLBACK_SLUG
    ? {
        title: 'Artikel Kalkunesia',
        excerpt: 'Konten blog akan tampil setelah artikel aktif tersedia di Supabase Central.',
        content: 'Belum ada artikel yang aktif untuk diekspor secara statis. Pastikan data artikel sudah tersedia, lalu jalankan build ulang.',
        publish_date: null,
      }
    : null);
  if (!article) notFound();
  const plainContent = article.content.replace(/<[^>]*>/g, '').trim();

  return (
    <>
      <Navbar variant="simple" />
      <div className="breadcrumb">
        <div className="bc-inner">
          <a className="bc-link" href="/">Home</a>
          <span className="bc-sep">›</span>
          <a className="bc-link" href="/blog">Blog</a>
          <span className="bc-sep">›</span>
          <span>{article.title}</span>
        </div>
      </div>

      <article style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', lineHeight: 1.3, marginBottom: 12 }}>
            {article.title}
          </h1>
          {article.excerpt && (
            <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7 }}>{article.excerpt}</p>
          )}
          {article.publish_date && (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, fontFamily: "'Inconsolata',monospace" }}>
              {new Date(article.publish_date).toLocaleDateString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </div>
          )}
        </header>

        <div
          className="prose"
          style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap' }}
        >
          {plainContent}
        </div>
      </article>

      <FooterSimple />
    </>
  );
}
