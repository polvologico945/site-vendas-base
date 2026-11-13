-- Sua Loja — banco, autenticação, segurança e catálogo
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('admin','viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  brand text,
  description text,
  price numeric(10,2) check (price is null or price >= 0),
  promotional_price numeric(10,2) check (promotional_price is null or promotional_price >= 0),
  image_url text,
  active boolean not null default true,
  featured boolean not null default false,
  stock_status text not null default 'available' check (stock_status in ('available','low','unavailable')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'Sua Loja',
  tagline text not null default 'Produtos escolhidos com cuidado. Atendimento que faz a diferença.',
  whatsapp text not null default '',
  instagram text,
  address text,
  logo_url text,
  hero_image_url text,
  primary_color text not null default '#07883d',
  accent_color text not null default '#c32222',
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id, instagram, address, logo_url, hero_image_url)
values (1, '', '', '/brand/logo.svg', '/brand/cover.svg')
on conflict (id) do nothing;

insert into public.categories (name, slug, description, sort_order) values
('Categoria A','categoria-a','Opções práticas para o dia a dia.',1),
('Categoria B','categoria-b','Proteicas, energéticas e funcionais.',2),
('Categoria C','categoria-c','Diversas marcas, objetivos e tamanhos.',3),
('Categoria D','categoria-d','Energia e foco para o treino.',4)
on conflict (slug) do nothing;

insert into public.products (category_id,name,brand,description,featured,sort_order)
select id,'Produto de exemplo','Marca A','Consulte opções e disponibilidade.',true,1 from public.categories where slug='categoria-a'
on conflict do nothing;
insert into public.products (category_id,name,brand,description,featured,sort_order)
select id,'Produto de exemplo B','Marca B','Consulte opções e disponibilidade.',true,2 from public.categories where slug='categoria-b'
on conflict do nothing;
insert into public.products (category_id,name,brand,description,sort_order)
select id,'Categoria B','Marca C','Consulte opções e disponibilidade.',3 from public.categories where slug='categoria-b'
on conflict do nothing;
insert into public.products (category_id,name,brand,description,featured,sort_order)
select id,'Produto de exemplo C','Várias marcas','Cadastre produto-teste, produto-novo, vitaminas e outros itens pelo painel.',true,4 from public.categories where slug='categoria-c'
on conflict do nothing;
insert into public.products (category_id,name,brand,description,featured,sort_order)
select id,'Produto de exemplo D','Várias marcas','Consulte opções e disponibilidade.',true,5 from public.categories where slug='categoria-d'
on conflict do nothing;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.store_settings enable row level security;

create policy "Public read active categories" on public.categories for select using (active = true or public.is_admin());
create policy "Admin manages categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Public read active products" on public.products for select using (active = true or public.is_admin());
create policy "Admin manages products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "Public reads store settings" on public.store_settings for select using (true);
create policy "Admin updates store settings" on public.store_settings for update using (public.is_admin()) with check (public.is_admin());
create policy "User reads own profile" on public.profiles for select using (id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog','catalog',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true, file_size_limit=5242880, allowed_mime_types=array['image/jpeg','image/png','image/webp'];

create policy "Public reads catalog images" on storage.objects for select using (bucket_id='catalog');
create policy "Admin uploads catalog images" on storage.objects for insert with check (bucket_id='catalog' and public.is_admin());
create policy "Admin updates catalog images" on storage.objects for update using (bucket_id='catalog' and public.is_admin()) with check (bucket_id='catalog' and public.is_admin());
create policy "Admin deletes catalog images" on storage.objects for delete using (bucket_id='catalog' and public.is_admin());

-- Depois de criar o usuário administrativo em Authentication > Users, execute:
-- insert into public.profiles (id, role)
-- select id, 'admin' from auth.users where email = 'EMAIL_DO_ADMIN@EXEMPLO.COM'
-- on conflict (id) do update set role='admin';
