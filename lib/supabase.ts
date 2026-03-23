import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client default (tanpa auth) — untuk operasi publik
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client dengan Clerk JWT — untuk operasi yang butuh auth (RLS)
export function getAuthClient(token: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
