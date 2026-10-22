-- =====================================================================
--  Unamed Canapé. — Schéma principal
--  Tables, types, index, triggers. RLS dans 0002, fonctions dans 0003.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------
create type public.user_role as enum ('customer', 'admin');

create type public.order_status as enum (
  'pending',     -- créée, en attente de paiement
  'paid',        -- payée
  'preparing',   -- en atelier
  'shipped',     -- expédiée
  'delivered',   -- livrée
  'cancelled'    -- annulée
);

create type public.cart_event_type as enum ('add', 'update', 'remove', 'checkout');

-- ---------------------------------------------------------------------
-- Utilitaire : updated_at automatique
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------
-- Profils (1-1 avec auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  first_name  text,
  last_name   text,
  phone       text,
  role        public.user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Adresses
-- ---------------------------------------------------------------------
create table public.addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  full_name    text not null,
  line1        text not null,
  line2        text,
  postal_code  text not null,
  city         text not null,
  country      text not null default 'France',
  phone        text,
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index addresses_user_idx on public.addresses (user_id);
-- une seule adresse par défaut par client
create unique index addresses_one_default on public.addresses (user_id) where is_default;

-- ---------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------
create table public.categories (
  id           smallint generated always as identity primary key,
  slug         text not null unique,
  name         text not null,
  description  text,
  position     smallint not null default 0
);

create table public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  tagline          text not null,
  description      text not null,
  story            text,
  category_id      smallint not null references public.categories (id),
  base_price       numeric(10,2) not null check (base_price > 0),
  compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price > base_price),
  width_cm         smallint,
  depth_cm         smallint,
  height_cm        smallint,
  seat_height_cm   smallint,
  seats            smallint,
  materials        text,
  frame            text,
  lead_time_weeks  smallint not null default 6,
  is_featured      boolean not null default false,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create index products_active_idx on public.products (is_active, is_featured);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  url         text not null,
  alt         text not null,
  position    smallint not null default 0
);
create index product_images_product_idx on public.product_images (product_id, position);

-- Variantes = coloris / tissu. Le stock vit ici.
create table public.product_variants (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  sku          text not null unique,
  color_name   text not null,
  color_hex    text not null check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  fabric       text not null,
  price_delta  numeric(10,2) not null default 0,
  stock        integer not null default 0 check (stock >= 0),
  image_position smallint,          -- photo de la galerie qui montre ce coloris
  position     smallint not null default 0,
  unique (product_id, color_name)
);
create index product_variants_product_idx on public.product_variants (product_id);

-- ---------------------------------------------------------------------
-- Panier persistant + historique
-- ---------------------------------------------------------------------
create table public.carts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  cart_id     uuid not null references public.carts (id) on delete cascade,
  variant_id  uuid not null references public.product_variants (id) on delete cascade,
  quantity    integer not null check (quantity between 1 and 10),
  added_at    timestamptz not null default now(),
  unique (cart_id, variant_id)
);
create index cart_items_cart_idx on public.cart_items (cart_id);

-- Journal immuable de chaque action panier (alimente l'historique + KPIs)
create table public.cart_events (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  variant_id  uuid references public.product_variants (id) on delete set null,
  event       public.cart_event_type not null,
  quantity    integer not null default 0,
  created_at  timestamptz not null default now()
);
create index cart_events_user_idx on public.cart_events (user_id, created_at desc);
create index cart_events_created_idx on public.cart_events (created_at);

-- Trigger : chaque modification de cart_items est journalisée
create or replace function public.log_cart_event()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_user uuid;
begin
  select user_id into v_user from public.carts
   where id = coalesce(new.cart_id, old.cart_id);
  if v_user is null then
    return coalesce(new, old);
  end if;

  if tg_op = 'INSERT' then
    insert into public.cart_events (user_id, variant_id, event, quantity)
    values (v_user, new.variant_id, 'add', new.quantity);
  elsif tg_op = 'UPDATE' and new.quantity <> old.quantity then
    insert into public.cart_events (user_id, variant_id, event, quantity)
    values (v_user, new.variant_id, 'update', new.quantity);
  elsif tg_op = 'DELETE' and coalesce(current_setting('app.checkout', true), '') <> 'on' then
    insert into public.cart_events (user_id, variant_id, event, quantity)
    values (v_user, old.variant_id, 'remove', old.quantity);
  end if;

  update public.carts set updated_at = now() where id = coalesce(new.cart_id, old.cart_id);
  return coalesce(new, old);
end $$;

create trigger cart_items_log
  after insert or update or delete on public.cart_items
  for each row execute function public.log_cart_event();

-- ---------------------------------------------------------------------
-- Codes promo
-- ---------------------------------------------------------------------
create table public.coupons (
  code         text primary key check (code = upper(code)),
  description  text,
  percent_off  smallint check (percent_off between 1 and 90),
  amount_off   numeric(10,2) check (amount_off > 0),
  min_subtotal numeric(10,2) not null default 0,
  max_uses     integer,
  used_count   integer not null default 0,
  expires_at   timestamptz,
  is_active    boolean not null default true,
  check ((percent_off is null) <> (amount_off is null))
);

-- ---------------------------------------------------------------------
-- Commandes
-- ---------------------------------------------------------------------
create sequence public.order_number_seq start 1001;

create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text not null unique
                    default 'UC-' || to_char(now(), 'YY') || '-' || nextval('public.order_number_seq'),
  user_id           uuid not null references public.profiles (id) on delete restrict,
  status            public.order_status not null default 'paid',
  subtotal          numeric(10,2) not null,
  discount          numeric(10,2) not null default 0,
  shipping          numeric(10,2) not null default 0,
  total             numeric(10,2) not null,
  coupon_code       text references public.coupons (code),
  shipping_address  jsonb not null,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (total = subtotal - discount + shipping)
);
create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_created_idx on public.orders (created_at);
create index orders_status_idx on public.orders (status);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- Lignes de commande : on fige nom / prix au moment de l'achat
create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  variant_id    uuid references public.product_variants (id) on delete set null,
  product_name  text not null,
  variant_label text not null,
  image_url     text,
  unit_price    numeric(10,2) not null,
  quantity      integer not null check (quantity > 0),
  line_total    numeric(10,2) generated always as (unit_price * quantity) stored
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

-- Historique des statuts (traçabilité)
create table public.order_status_history (
  id          bigint generated always as identity primary key,
  order_id    uuid not null references public.orders (id) on delete cascade,
  status      public.order_status not null,
  changed_by  uuid references public.profiles (id),
  changed_at  timestamptz not null default now()
);
create index order_status_history_order_idx on public.order_status_history (order_id, changed_at);

create or replace function public.log_order_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end $$;

create trigger orders_status_log
  after insert or update of status on public.orders
  for each row execute function public.log_order_status();

-- ---------------------------------------------------------------------
-- Analytics & marketing
-- ---------------------------------------------------------------------
create table public.product_views (
  id          bigint generated always as identity primary key,
  product_id  uuid not null references public.products (id) on delete cascade,
  user_id     uuid references public.profiles (id) on delete set null,
  session_id  text,
  viewed_at   timestamptz not null default now()
);
create index product_views_product_idx on public.product_views (product_id, viewed_at);
create index product_views_viewed_idx on public.product_views (viewed_at);

create table public.newsletter_subscribers (
  email       text primary key check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source      text default 'footer',
  created_at  timestamptz not null default now()
);

-- Messages du Concierge (conseiller IA) — pour analyser les besoins clients
create table public.concierge_messages (
  id          bigint generated always as identity primary key,
  user_id     uuid references public.profiles (id) on delete set null,
  session_id  text not null,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);
create index concierge_messages_session_idx on public.concierge_messages (session_id, created_at);
