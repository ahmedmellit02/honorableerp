
-- Enable UUID generation if needed
create extension if not exists "pgcrypto";

-- 1) Sales table
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  client_name text not null,
  phone_number text not null,
  pnr text,
  buying_price numeric(12,2) not null check (buying_price >= 0),
  selling_price numeric(12,2) not null check (selling_price >= 0),
  -- Profit is auto-computed and stored
  profit numeric(12,2) generated always as (selling_price - buying_price) stored,
  system text not null,
  agent text not null,
  departure_date date not null,
  departure_time time not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.sales is 'Sales records for the app. RLS restricts to row owner via user_id.';
comment on column public.sales.user_id is 'The owner of the sale; matches auth.uid() during queries (no FK by design).';

-- 2) Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_sales_updated_at on public.sales;
create trigger set_sales_updated_at
before update on public.sales
for each row
execute function public.set_updated_at();

-- 3) Row Level Security
alter table public.sales enable row level security;

-- Users can view their own sales
drop policy if exists "Users can view their own sales" on public.sales;
create policy "Users can view their own sales"
  on public.sales
  for select
  using (auth.uid() = user_id);

-- Users can insert their own sales
drop policy if exists "Users can insert their own sales" on public.sales;
create policy "Users can insert their own sales"
  on public.sales
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own sales
drop policy if exists "Users can update their own sales" on public.sales;
create policy "Users can update their own sales"
  on public.sales
  for update
  using (auth.uid() = user_id);

-- Users can delete their own sales
drop policy if exists "Users can delete their own sales" on public.sales;
create policy "Users can delete their own sales"
  on public.sales
  for delete
  using (auth.uid() = user_id);

-- 4) Helpful indexes
create index if not exists sales_user_id_created_at_idx on public.sales (user_id, created_at desc);
create index if not exists sales_user_id_type_idx on public.sales (user_id, type);
create index if not exists sales_created_at_idx on public.sales (created_at desc);

-- 5) Realtime support
alter table public.sales replica identity full;

do $$
begin
  -- Add to realtime publication (ignore if already added)
  begin
    alter publication supabase_realtime add table public.sales;
  exception
    when duplicate_object then null;
  end;
end$$;

-- 6) Aggregation views for charts and KPIs
-- Monthly aggregates (RLS on base table ensures per-user visibility)
create or replace view public.sales_monthly_aggregates as
select
  date_trunc('month', created_at)::date as month,
  count(*)::bigint as sales,
  coalesce(sum(selling_price), 0)::numeric(12,2) as revenue,
  coalesce(sum(selling_price - buying_price), 0)::numeric(12,2) as profit
from public.sales
group by 1
order by 1;

-- Sales by type aggregates
create or replace view public.sales_by_type_aggregates as
select
  type,
  count(*)::bigint as count,
  coalesce(sum(selling_price), 0)::numeric(12,2) as revenue
from public.sales
group by 1
order by count desc;
