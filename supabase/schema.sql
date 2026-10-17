-- আল-মদিনা ফুড POS — Supabase schema
-- Supabase Dashboard → SQL Editor → paste → Run

-- ============ TABLES ============
create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  cat text not null default '',
  price numeric not null default 0,
  buy numeric not null default 0,
  stock integer not null default 0,
  emoji text not null default '🍛',
  barcode text,
  expiry date,
  created_at timestamptz not null default now()
);

create table if not exists sales (
  id bigint generated always as identity primary key,
  date date not null,
  time text not null default '',
  token text not null default '',
  customer text not null default '',
  total numeric not null default 0,
  paid numeric not null default 0,
  due numeric not null default 0,
  method text not null default 'Cash',
  table_no text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists sale_items (
  id bigint generated always as identity primary key,
  sale_id bigint not null references sales(id) on delete cascade,
  product_id bigint references products(id) on delete set null,
  name text not null,
  qty integer not null default 1,
  price numeric not null default 0
);

create table if not exists expenses (
  id bigint generated always as identity primary key,
  date date not null,
  cat text not null,
  amount numeric not null default 0,
  note text,
  created_at timestamptz not null default now()
);

-- ============ RLS (permissive SELECT for anon; writes via service-role API routes) ============
alter table products enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table expenses enable row level security;

drop policy if exists "public read products" on products;
create policy "public read products" on products for select to anon using (true);

drop policy if exists "public read sales" on sales;
create policy "public read sales" on sales for select to anon using (true);

drop policy if exists "public read sale_items" on sale_items;
create policy "public read sale_items" on sale_items for select to anon using (true);

drop policy if exists "public read expenses" on expenses;
create policy "public read expenses" on expenses for select to anon using (true);

-- ============ SEED DATA (from the original HTML app) ============
insert into products (name, cat, price, buy, stock, emoji, barcode, expiry) values
  ('চিকেন বিরিয়ানি', 'biryani', 180, 120, 45,  '🍛', '880100000001', '2026-10-16'),
  ('বিফ খিচুড়ি',    'khichuri', 150, 95,  30,  '🍲', '880100000002', '2026-10-15'),
  ('পরোটা + ডাল',   'nasta',     40,  20,  100, '🫓', '880100000003', null),
  ('চা দুধ',        'drinks',    25,  12,  200, '☕', '880100000004', null),
  ('সমুচা',         'snacks',    15,   8,   80, '🥟', '880100000005', null),
  ('কোক 250ml',     'drinks',    30,  20,   50, '🥤', '880100000006', null);

-- sales (tokens T-001..T-005)
insert into sales (date, time, token, customer, total, paid, due, method, table_no) values
  ('2026-10-15', '10:30', 'T-001', 'রহিম',   360, 360, 0,  'Cash',  '3'),
  ('2026-10-15', '11:15', 'T-002', 'করিম',   150, 150, 0,  'Bkash', '5'),
  ('2026-10-14', '13:20', 'T-003', 'জামাল',  120, 100, 20, 'Cash',  '1'),
  ('2026-10-14', '19:00', 'T-004', 'সালমা',  540, 540, 0,  'Nagad', '2'),
  ('2026-10-13', '09:10', 'T-005', 'আব্দুল',  75,  75,  0,  'Cash',  '4');

-- sale_items (link via product name -> id)
insert into sale_items (sale_id, product_id, name, qty, price)
select s.id, p.id, x.name, x.qty, x.price
from (values
  ('T-001', 'বিরিয়ানি', 2, 180),
  ('T-002', 'খিচুড়ি',   1, 150),
  ('T-003', 'পরোটা',     3, 40),
  ('T-004', 'বিরিয়ানি', 3, 180),
  ('T-005', 'সমুচা',     5, 15)
) as x(token, name, qty, price)
join sales s on s.token = x.token
join products p on p.id = case
  when x.name = 'বিরিয়ানি' then 1
  when x.name = 'খিচুড়ি'   then 2
  when x.name = 'পরোটা'     then 3
  when x.name = 'সমুচা'     then 5
end;

insert into expenses (date, cat, amount, note) values
  ('2026-10-15', 'ভাড়া',    8000, 'অক্টোবর'),
  ('2026-10-15', 'গ্যাস',    1400, null),
  ('2026-10-14', 'কাঁচামাল', 3500, null);

-- reset identity sequences so new rows continue after the seed
select setval(pg_get_serial_sequence('products','id'), (select max(id) from products));
select setval(pg_get_serial_sequence('sales','id'), (select max(id) from sales));
select setval(pg_get_serial_sequence('sale_items','id'), (select max(id) from sale_items));
select setval(pg_get_serial_sequence('expenses','id'), (select max(id) from expenses));
