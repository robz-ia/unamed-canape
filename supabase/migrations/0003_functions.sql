-- =====================================================================
--  Unamed Canapé. — Logique métier en base (RPC)
--  Appelées depuis Next.js via supabase.rpc('nom', {...})
-- =====================================================================

-- ---------------------------------------------------------------------
-- add_to_cart : crée le panier si besoin, cumule la quantité,
-- plafonne au stock disponible et à 10. Renvoie le nb d'articles.
-- ---------------------------------------------------------------------
create or replace function public.add_to_cart(p_variant_id uuid, p_quantity int default 1)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_user  uuid := auth.uid();
  v_cart  uuid;
  v_stock int;
  v_count int;
begin
  if v_user is null then
    raise exception 'Connexion requise' using errcode = '28000';
  end if;
  if p_quantity < 1 then
    raise exception 'Quantité invalide';
  end if;

  select stock into v_stock from product_variants where id = p_variant_id;
  if v_stock is null then
    raise exception 'Variante introuvable';
  end if;
  if v_stock = 0 then
    raise exception 'Ce coloris est momentanément épuisé';
  end if;

  insert into carts (user_id) values (v_user)
  on conflict (user_id) do update set updated_at = now()
  returning id into v_cart;

  insert into cart_items (cart_id, variant_id, quantity)
  values (v_cart, p_variant_id, least(p_quantity, v_stock, 10))
  on conflict (cart_id, variant_id)
  do update set quantity = least(cart_items.quantity + excluded.quantity, v_stock, 10);

  select coalesce(sum(quantity), 0) into v_count from cart_items where cart_id = v_cart;
  return v_count;
end $$;

-- ---------------------------------------------------------------------
-- validate_coupon : vérifie un code et calcule la remise
-- ---------------------------------------------------------------------
create or replace function public.validate_coupon(p_code text, p_subtotal numeric)
returns table (code text, discount numeric, description text)
language plpgsql stable security definer set search_path = public as $$
declare
  c coupons%rowtype;
begin
  select * into c from coupons
   where coupons.code = upper(trim(p_code)) and is_active;

  if not found then
    raise exception 'Code promo inconnu';
  end if;
  if c.expires_at is not null and c.expires_at < now() then
    raise exception 'Ce code a expiré';
  end if;
  if c.max_uses is not null and c.used_count >= c.max_uses then
    raise exception 'Ce code a atteint sa limite d''utilisation';
  end if;
  if p_subtotal < c.min_subtotal then
    raise exception 'Montant minimum : % €', c.min_subtotal;
  end if;

  code := c.code;
  description := c.description;
  discount := round(coalesce(p_subtotal * c.percent_off / 100.0, least(c.amount_off, p_subtotal)), 2);
  return next;
end $$;

-- ---------------------------------------------------------------------
-- place_order : transaction atomique panier -> commande
--   1. verrouille les variantes (FOR UPDATE) et vérifie le stock
--   2. calcule sous-total, remise, livraison
--   3. crée la commande + lignes (prix figés)
--   4. décrémente le stock, consomme le coupon, vide le panier
-- ---------------------------------------------------------------------
create or replace function public.place_order(
  p_address jsonb,
  p_coupon  text default null,
  p_notes   text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_user     uuid := auth.uid();
  v_cart     uuid;
  v_subtotal numeric(10,2);
  v_discount numeric(10,2) := 0;
  v_shipping numeric(10,2);
  v_code     text;
  v_order    uuid;
  r          record;
begin
  if v_user is null then
    raise exception 'Connexion requise' using errcode = '28000';
  end if;
  if coalesce(p_address ->> 'full_name', '') = '' or coalesce(p_address ->> 'line1', '') = ''
     or coalesce(p_address ->> 'postal_code', '') = '' or coalesce(p_address ->> 'city', '') = '' then
    raise exception 'Adresse de livraison incomplète';
  end if;

  select id into v_cart from carts where user_id = v_user;
  if v_cart is null or not exists (select 1 from cart_items where cart_id = v_cart) then
    raise exception 'Votre panier est vide';
  end if;

  -- Verrou + contrôle de stock
  for r in
    select ci.quantity, v.id as variant_id, v.stock, v.color_name, p.name
      from cart_items ci
      join product_variants v on v.id = ci.variant_id
      join products p on p.id = v.product_id
     where ci.cart_id = v_cart
       for update of v
  loop
    if r.stock < r.quantity then
      raise exception 'Stock insuffisant pour % — %', r.name, r.color_name;
    end if;
  end loop;

  select sum((p.base_price + v.price_delta) * ci.quantity)
    into v_subtotal
    from cart_items ci
    join product_variants v on v.id = ci.variant_id
    join products p on p.id = v.product_id
   where ci.cart_id = v_cart;

  if p_coupon is not null and trim(p_coupon) <> '' then
    select vc.code, vc.discount into v_code, v_discount
      from validate_coupon(p_coupon, v_subtotal) vc;
    update coupons set used_count = used_count + 1 where code = v_code;
  end if;

  -- Livraison & installation offertes dès 1 500 €
  v_shipping := case when v_subtotal - v_discount >= 1500 then 0 else 149 end;

  insert into orders (user_id, subtotal, discount, shipping, total, coupon_code, shipping_address, notes)
  values (v_user, v_subtotal, v_discount, v_shipping, v_subtotal - v_discount + v_shipping,
          v_code, p_address, nullif(trim(p_notes), ''))
  returning id into v_order;

  insert into order_items (order_id, product_id, variant_id, product_name, variant_label, image_url, unit_price, quantity)
  select v_order, p.id, v.id, p.name, v.color_name || ' · ' || v.fabric,
         (select url from product_images pi where pi.product_id = p.id order by position limit 1),
         p.base_price + v.price_delta, ci.quantity
    from cart_items ci
    join product_variants v on v.id = ci.variant_id
    join products p on p.id = v.product_id
   where ci.cart_id = v_cart;

  update product_variants v
     set stock = v.stock - ci.quantity
    from cart_items ci
   where ci.cart_id = v_cart and ci.variant_id = v.id;

  insert into cart_events (user_id, variant_id, event, quantity)
  select v_user, ci.variant_id, 'checkout', ci.quantity from cart_items ci where ci.cart_id = v_cart;

  -- Vidage du panier sans polluer l'historique avec des 'remove'
  perform set_config('app.checkout', 'on', true);
  delete from cart_items where cart_id = v_cart;
  perform set_config('app.checkout', 'off', true);

  return v_order;
end $$;

-- ---------------------------------------------------------------------
-- admin_kpis : tableau de bord en un seul aller-retour
-- ---------------------------------------------------------------------
create or replace function public.admin_kpis(p_days int default 30)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_from      timestamptz := date_trunc('day', now()) - make_interval(days => p_days - 1);
  v_prev_from timestamptz := v_from - make_interval(days => p_days);
  result      jsonb;
begin
  if not public.is_admin() then
    raise exception 'Accès réservé à l''administration' using errcode = '42501';
  end if;

  with
  valid_orders as (
    select * from orders where status not in ('cancelled', 'pending')
  ),
  cur as (
    select coalesce(sum(total), 0) as revenue, count(*) as orders,
           count(distinct user_id) as buyers
      from valid_orders where created_at >= v_from
  ),
  prev as (
    select coalesce(sum(total), 0) as revenue, count(*) as orders
      from valid_orders where created_at >= v_prev_from and created_at < v_from
  ),
  visitors as (
    select count(distinct coalesce(user_id::text, session_id)) as n, count(*) as views
      from product_views where viewed_at >= v_from
  ),
  adds as (
    select count(*) as n from cart_events where event = 'add' and created_at >= v_from
  ),
  days as (
    select generate_series(v_from, date_trunc('day', now()), interval '1 day')::date as day
  ),
  series as (
    select d.day,
           coalesce(sum(o.total), 0) as revenue,
           count(o.id) as orders
      from days d
      left join valid_orders o on o.created_at::date = d.day
     group by d.day order by d.day
  ),
  top_products as (
    select oi.product_name as name, sum(oi.quantity) as units, sum(oi.line_total) as revenue
      from order_items oi join valid_orders o on o.id = oi.order_id
     where o.created_at >= v_from
     group by oi.product_name order by revenue desc limit 6
  ),
  most_viewed as (
    select p.name, count(*) as views
      from product_views pv join products p on p.id = pv.product_id
     where pv.viewed_at >= v_from
     group by p.name order by views desc limit 6
  ),
  by_status as (
    select status, count(*) as n from orders group by status
  ),
  abandoned as (
    select count(*) as n, coalesce(sum(val), 0) as value from (
      select c.id, sum((p.base_price + v.price_delta) * ci.quantity) as val
        from carts c
        join cart_items ci on ci.cart_id = c.id
        join product_variants v on v.id = ci.variant_id
        join products p on p.id = v.product_id
       where c.updated_at < now() - interval '24 hours'
       group by c.id
    ) x
  ),
  low_stock as (
    select p.name, v.color_name, v.sku, v.stock
      from product_variants v join products p on p.id = v.product_id
     where v.stock <= 3 order by v.stock, p.name limit 10
  ),
  recent as (
    select o.id, o.order_number, o.status, o.total, o.created_at,
           coalesce(nullif(trim(coalesce(pr.first_name, '') || ' ' || coalesce(pr.last_name, '')), ''), pr.email) as customer
      from orders o join profiles pr on pr.id = o.user_id
     order by o.created_at desc limit 8
  )
  select jsonb_build_object(
    'period_days',       p_days,
    'revenue',           (select revenue from cur),
    'revenue_prev',      (select revenue from prev),
    'orders',            (select orders from cur),
    'orders_prev',       (select orders from prev),
    'aov',               (select case when orders > 0 then round(revenue / orders, 2) else 0 end from cur),
    'customers_total',   (select count(*) from profiles where role = 'customer'),
    'customers_new',     (select count(*) from profiles where role = 'customer' and created_at >= v_from),
    'visitors',          (select n from visitors),
    'product_views',     (select views from visitors),
    'add_to_cart',       (select n from adds),
    'conversion_rate',   (select case when v.n > 0 then round(c.buyers::numeric * 100 / v.n, 1) else 0 end
                            from cur c, visitors v),
    'abandoned_carts',   (select n from abandoned),
    'abandoned_value',   (select value from abandoned),
    'newsletter',        (select count(*) from newsletter_subscribers),
    'series',            (select coalesce(jsonb_agg(series), '[]'::jsonb) from series),
    'top_products',      (select coalesce(jsonb_agg(top_products), '[]'::jsonb) from top_products),
    'most_viewed',       (select coalesce(jsonb_agg(most_viewed), '[]'::jsonb) from most_viewed),
    'orders_by_status',  (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb) from by_status),
    'low_stock',         (select coalesce(jsonb_agg(low_stock), '[]'::jsonb) from low_stock),
    'recent_orders',     (select coalesce(jsonb_agg(recent), '[]'::jsonb) from recent)
  ) into result;

  return result;
end $$;

revoke execute on function public.add_to_cart(uuid, int)         from public, anon;
revoke execute on function public.validate_coupon(text, numeric) from public, anon;
revoke execute on function public.place_order(jsonb, text, text) from public, anon;
revoke execute on function public.admin_kpis(int)                from public, anon;
grant  execute on function public.add_to_cart(uuid, int)         to authenticated;
grant  execute on function public.validate_coupon(text, numeric) to authenticated;
grant  execute on function public.place_order(jsonb, text, text) to authenticated;
grant  execute on function public.admin_kpis(int)                to authenticated;
