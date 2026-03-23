import { createClient } from '@supabase/supabase-js';

const centralUrl = process.env.NEXT_PUBLIC_SUPABASE_CENTRAL_URL!;
const centralKey = process.env.NEXT_PUBLIC_SUPABASE_CENTRAL_ANON_KEY!;

export const supabaseCentral = createClient(centralUrl, centralKey);

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  ecosystem: string[];
  is_featured: boolean;
  is_listed: boolean;
  is_active: boolean;
  priority: number;
  publish_date: string | null;
  expire_date: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
}
