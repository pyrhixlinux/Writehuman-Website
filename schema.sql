-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Orders Table (Safe if exists)
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  status text check (status in ('pending', 'proses', 'selesai')) default 'pending',
  file_url text, -- Stores the signed URL or path.
  created_at timestamp with time zone default now()
);

-- 2. Create Reviews Table (Safe if exists)
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  /* If you want to link reviews to specific orders, uncomment below:
     order_id uuid references public.orders(id),
  */
  rating int check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now()
);

-- 3. Enable RLS
alter table public.orders enable row level security;
alter table public.reviews enable row level security;

-- 4. Policies for Orders (Drop first to allow re-run)

drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" 
on public.orders for select 
using (auth.uid() = user_id);

drop policy if exists "Users can create own orders" on public.orders;
create policy "Users can create own orders" 
on public.orders for insert 
with check (auth.uid() = user_id);

drop policy if exists "Admin full access" on public.orders;
create policy "Admin full access"
on public.orders for all
using (auth.jwt() ->> 'email' = 'admin@example.com'); -- CHANGE THIS TO YOUR ADMIN EMAIL

-- 5. Policies for Reviews

drop policy if exists "Public can read reviews" on public.reviews;
create policy "Public can read reviews"
on public.reviews for select
using (true);

drop policy if exists "Authenticated users can create reviews" on public.reviews;
create policy "Authenticated users can create reviews"
on public.reviews for insert
with check (auth.role() = 'authenticated');
