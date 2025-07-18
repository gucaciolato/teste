-- Cria a tabela de procedimentos (e as demais, caso não existam)
create extension if not exists "uuid-ossp";

create table if not exists public.procedures (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Exemplo de índices e RLS (opcional - já havia sido mostrado antes)
create index if not exists procedures_user_idx on public.procedures(user_id);

alter table public.procedures enable row level security;

create policy "Users can view own procedures"
  on public.procedures for select
  using (auth.uid() = user_id);

create policy "Users can insert own procedures"
  on public.procedures for insert
  with check (auth.uid() = user_id);

create policy "Users can update own procedures"
  on public.procedures for update
  using (auth.uid() = user_id);

create policy "Users can delete own procedures"
  on public.procedures for delete
  using (auth.uid() = user_id);
