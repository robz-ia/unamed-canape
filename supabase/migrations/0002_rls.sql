-- =====================================================================
--  Unamed Canapé. — Sécurité (Row Level Security)
--  Principe : chaque client ne voit que ses données, l'admin voit tout.
--  Les écritures sensibles (commandes, stock) passent par des fonctions
--  SECURITY DEFINER (voir 0003), jamais par un INSERT direct.
-- =====================================================================

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Un client ne peut pas se promouvoir admin.
-- (auth.uid() est nul dans l'éditeur SQL / avec la service role : promotion autorisée)
create or replace function public.protect_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Modification du rôle interdite';
  end if;
  return new;
end $$;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_role();

alter table public.profiles               enable row level security;
alter table public.addresses              enable row level security;
alter table public.categories             enable row level security;
alter table public.products               enable row level security;
alter table public.product_images         enable row level security;
alter table public.product_categories     enable row level security;
alter table public.product_variants       enable row level security;
alter table public.carts                  enable row level security;
alter table public.cart_items             enable row level security;
alter table public.cart_events            enable row level security;
alter table public.coupons                enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.order_status_history   enable row level security;
alter table public.product_views          enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.concierge_messages     enable row level security;

-- Profils -------------------------------------------------------------
create policy "profil: lecture soi ou admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profil: mise à jour soi ou admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- Adresses ------------------------------------------------------------
create policy "adresses: propriétaire" on public.addresses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "adresses: admin lecture" on public.addresses
  for select using (public.is_admin());

-- Catalogue (lecture publique, écriture admin) -------------------------
create policy "categories: lecture publique" on public.categories
  for select using (true);
create policy "categories: admin" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "produits: lecture publique" on public.products
  for select using (is_active or public.is_admin());
create policy "produits: admin" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

create policy "appartenances: lecture publique" on public.product_categories
  for select using (true);
create policy "appartenances: admin" on public.product_categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "images: lecture publique" on public.product_images
  for select using (true);
create policy "images: admin" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

create policy "variantes: lecture publique" on public.product_variants
  for select using (true);
create policy "variantes: admin" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

-- Panier --------------------------------------------------------------
create policy "panier: propriétaire" on public.carts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "panier: admin lecture" on public.carts
  for select using (public.is_admin());

create policy "lignes panier: propriétaire" on public.cart_items
  for all using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  );
create policy "lignes panier: admin lecture" on public.cart_items
  for select using (public.is_admin());

create policy "historique panier: soi ou admin" on public.cart_events
  for select using (user_id = auth.uid() or public.is_admin());

-- Codes promo : uniquement via validate_coupon() côté client -----------
create policy "coupons: admin" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- Commandes -----------------------------------------------------------
create policy "commandes: soi ou admin" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
create policy "commandes: admin mise à jour" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

create policy "lignes commande: soi ou admin" on public.order_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "statuts commande: soi ou admin" on public.order_status_history
  for select using (
    public.is_admin() or exists (
      select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- Analytics -----------------------------------------------------------
create policy "vues: insertion publique" on public.product_views
  for insert with check (user_id is null or user_id = auth.uid());
create policy "vues: admin lecture" on public.product_views
  for select using (public.is_admin());

create policy "newsletter: inscription publique" on public.newsletter_subscribers
  for insert with check (true);
create policy "newsletter: admin lecture" on public.newsletter_subscribers
  for select using (public.is_admin());

create policy "concierge: insertion publique" on public.concierge_messages
  for insert with check (user_id is null or user_id = auth.uid());
create policy "concierge: admin lecture" on public.concierge_messages
  for select using (public.is_admin());
