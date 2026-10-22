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

## 3. Insérer en base

Ajouter le produit à `supabase/seed.sql` (pour pouvoir rejouer) ET exécuter dans le SQL Editor le bloc correspondant :

```sql
with p as (
  insert into public.products (slug, name, tagline, description, story, category_id, base_price,
    width_cm, depth_cm, height_cm, seat_height_cm, seats, materials, frame, lead_time_weeks)
  values ('slug', 'Nom', '…', '…', '…', (select id from public.categories where slug = 'canapes'), 1990,
    220, 95, 80, 43, 3, '…', '…', 6)
  returning id, slug
), imgs as (
  insert into public.product_images (product_id, url, alt, position)
  select id, '/products/' || slug || '/' || n || '.jpg', 'Nom — vue ' || n, n from p, generate_series(1, 3) n
)
insert into public.product_variants (product_id, sku, color_name, color_hex, fabric, price_delta, stock, position)
select id, 'XXX-CRE', 'Crème', '#EFE6D6', 'Chénille', 0, 8, 1 from p;
```

## 4. Vérifier

`/boutique` affiche la carte, `/produit/<slug>` la fiche, et le Concierge la recommande (il lit le catalogue en base à chaque requête).
