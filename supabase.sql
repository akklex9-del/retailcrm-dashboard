create table if not exists public.orders (
  id bigserial primary key,
  retailcrm_id bigint not null unique,
  number text,
  created_at timestamptz,
  status text,
  first_name text,
  last_name text,
  phone text,
  email text,
  city text,
  total_summ numeric(14,2) default 0,
  raw jsonb
);

create index if not exists idx_orders_created_at on public.orders (created_at desc);

create table if not exists public.telegram_notifications (
  id bigserial primary key,
  retailcrm_id bigint not null unique,
  sent_at timestamptz not null default now()
);
