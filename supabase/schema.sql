-- Tabel untuk menyimpan history kalkulasi user
create table if not exists calculation_history (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,              -- Clerk user ID
  tool_id text not null,              -- 'kpr', 'pph-21', 'bpjs', dll
  tool_name text not null,            -- 'KPR Calculator', dll
  label text not null,                -- nama skenario dari user
  inputs jsonb not null,              -- semua input yang diisi user
  result jsonb not null,              -- ringkasan hasil kalkulasi
  created_at timestamptz default now() not null
);

-- Index untuk query by user
create index if not exists idx_history_user_id on calculation_history(user_id);
create index if not exists idx_history_user_tool on calculation_history(user_id, tool_id);
create index if not exists idx_history_created on calculation_history(created_at desc);

-- RLS: user hanya bisa akses data miliknya sendiri
alter table calculation_history enable row level security;

create policy "Users can read own history"
  on calculation_history for select
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can insert own history"
  on calculation_history for insert
  with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can delete own history"
  on calculation_history for delete
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
