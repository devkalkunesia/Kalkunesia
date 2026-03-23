import { supabaseCentral, type Article } from './supabase-central';

export async function getAllArticles(): Promise<Article[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabaseCentral
    .from('articles')
    .select('*')
    .contains('ecosystem', ['kalkunesia'])
    .eq('is_active', true)
    .eq('is_listed', true)
    .lte('publish_date', now)
    .order('publish_date', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
  return (data ?? []) as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabaseCentral
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as Article;
}

export async function getFeaturedArticles(): Promise<Article[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabaseCentral
    .from('articles')
    .select('*')
    .contains('ecosystem', ['kalkunesia'])
    .eq('is_active', true)
    .eq('is_featured', true)
    .lte('publish_date', now)
    .order('priority', { ascending: false })
    .limit(3);

  if (error) return [];
  return (data ?? []) as Article[];
}
