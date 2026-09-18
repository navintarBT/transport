-- ClearWay parcel-tracking schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`)
-- after creating the project. Requires the pgcrypto/gen_random_uuid()
-- extension, which Supabase enables by default.

create table branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- One row per auth user: name, role, and which branch they work at.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'staff' check (role in ('staff', 'admin')),
  branch_id uuid references branches(id),
  created_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  address text,
  created_at timestamptz not null default now()
);

-- A parcel arrives from China into a branch and sits there until the
-- customer comes and picks it up in person — there is no door delivery.
create table parcels (
  id uuid primary key default gen_random_uuid(),
  tracking_no text not null unique,
  branch_id uuid not null references branches(id),
  sender_name text not null,
  sender_phone text not null,
  receiver_name text not null,
  receiver_phone text not null,
  receiver_address text not null,
  customer_id uuid references customers(id),
  weight_kg numeric(6, 2),
  parcel_type text not null default 'general' check (parcel_type in ('document', 'general', 'cold')),
  cost_amount numeric(10, 2) not null default 0,
  cod_amount numeric(10, 2) not null default 0,
  status text not null default 'pending_pickup' check (status in ('pending_pickup', 'picked_up', 'returned')),
  is_damaged boolean not null default false,
  damage_note text,
  created_at timestamptz not null default now(),
  picked_up_at timestamptz
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  parcel_id uuid references parcels(id) on delete cascade,
  branch_id uuid not null references branches(id),
  type text not null check (type in ('shipping_fee', 'cod', 'commission')),
  amount numeric(10, 2) not null,
  payment_status text not null default 'pending' check (payment_status in ('paid', 'pending')),
  created_at timestamptz not null default now()
);

create index parcels_branch_id_idx on parcels(branch_id);
create index parcels_created_at_idx on parcels(created_at);
create index transactions_branch_id_idx on transactions(branch_id);
create index transactions_created_at_idx on transactions(created_at);

-- Row Level Security: staff only see their own branch's data, admins see everything.
alter table branches enable row level security;
alter table profiles enable row level security;
alter table customers enable row level security;
alter table parcels enable row level security;
alter table transactions enable row level security;

create or replace function is_admin()
returns boolean
language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function my_branch_id()
returns uuid
language sql security definer stable as $$
  select branch_id from profiles where id = auth.uid();
$$;

create policy "branches_select" on branches for select using (auth.role() = 'authenticated');
create policy "branches_write" on branches for all using (is_admin()) with check (is_admin());

create policy "profiles_select_own" on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on profiles for update using (id = auth.uid());

create policy "customers_all" on customers for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "parcels_select" on parcels for select using (is_admin() or branch_id = my_branch_id());
create policy "parcels_insert" on parcels for insert with check (is_admin() or branch_id = my_branch_id());
create policy "parcels_update" on parcels for update using (is_admin() or branch_id = my_branch_id());

create policy "transactions_select" on transactions for select using (is_admin() or branch_id = my_branch_id());
create policy "transactions_insert" on transactions for insert with check (is_admin() or branch_id = my_branch_id());
