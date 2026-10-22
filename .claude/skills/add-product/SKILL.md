---
name: add-product
description: Ajoute une pièce au catalogue d'Unamed Canapé. (fiche produit rédigée, coloris, stock, images). Trigger : "ajouter un produit", "nouveau canapé", "nouvelle pièce", "ajoute au catalogue", lien Alibaba ou fiche fournisseur.
---

# Ajouter une pièce au catalogue

## 1. Rédiger la fiche (ton de la maison)

À partir de la fiche fournisseur, produire :
- `name` : un mot ou un nom propre français évocateur (Méandre, Galet, Nuage…). Jamais le nom fournisseur.
- `tagline` : ≤ 7 mots, ce qu'est la pièce (« Canapé organique en laine d'agneau »).
- `description` : 2 phrases — la forme, puis l'usage.
- `story` : 1 phrase sur l'intention de design.
- Dimensions en cm, nombre de places, `materials`, `frame`, `lead_time_weeks`.
- Prix de vente : prix fournisseur × 3 à 4, arrondi à la dizaine en 90 (1 890, 2 290…).
- `category` : `canapes`, `convertibles` ou `sculpturales`.
- 3 coloris max avec un hex réaliste, une matière, un supplément éventuel et un stock.

## 2. Images

`public/products/<slug>/1.jpg`, `2.jpg`, `3.jpg` (face, trois-quarts, détail matière), JPG ≤ 300 Ko, format portrait 4:5 de préférence. Sans image, le site affiche un dessin au trait : rien ne casse.

## 3. Options et variantes (modèle à deux options, façon Shopify)

- Chaque produit déclare `option1_name` (ex. « Format », « Longueur », « Coloris ») et éventuellement `option2_name`.
- Chaque **variante** = une combinaison (`option1`, `option2`) avec son `sku`, son `stock`, son `price_delta` (≥ 0) et, si l'option est un coloris, sa `swatch_hex`.
- `base_price` = prix de la configuration la moins chère ; une seule variante `is_default = true` (affichée à l'arrivée sur la fiche).
- Chaque **photo** peut être liée à une valeur d'option (`option1` / `option2`) : elle n'apparaît que si cette valeur est choisie. `null` = photo commune. `on_white = true` pour une photo sur fond blanc (détourage, schéma).

Exemple réel — Rive Gauche : Format (Une place / Deux places) × Garnissage (Mousse / Latex), défaut « Deux places · Mousse » ; les photos du une place n'apparaissent qu'après clic sur « Une place ».

## 4. Insérer en base

Ajouter le produit à `supabase/seed.sql` ET à `lib/catalog.ts` (catalogue de secours), puis exécuter dans le SQL Editor :

```sql
with p as (
  insert into public.products (slug, name, tagline, description, story, category_id, base_price,
    width_cm, depth_cm, height_cm, seat_height_cm, seats, materials, frame, lead_time_weeks, option1_name, option2_name)
  values ('slug', 'Nom', '…', '…', '…', (select id from public.categories where slug = 'canapes'), 1990,
    220, 95, 80, 43, 3, '…', '…', 6, 'Format', 'Coloris')
  returning id, slug
), imgs as (
  insert into public.product_images (product_id, url, alt, option1, option2, on_white, position)
  select id, '/products/' || slug || '/1.jpg', 'Nom — vue de face', null, 'Crème', true, 1 from p
)
insert into public.product_variants (product_id, sku, option1, option2, swatch_hex, price_delta, stock, is_default, position)
select id, 'XXX-2P-CRE', 'Deux places', 'Crème', '#EFE6D6', 0, 8, true, 1 from p;
```

## 5. Vérifier

`/boutique` affiche la carte, `/produit/<slug>` la fiche, et le Concierge la recommande (il lit le catalogue en base à chaque requête).
