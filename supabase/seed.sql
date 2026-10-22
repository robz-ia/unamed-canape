-- =====================================================================
--  Unamed Canapé. — Catalogue initial
--  Rejouable : supprime puis réinsère le catalogue.
-- =====================================================================

delete from public.products;
delete from public.categories;
delete from public.coupons where code in ('BIENVENUE10', 'SALON200');

insert into public.categories (slug, name, description, position) values
  ('canapes',     'Canapés',             'Des assises profondes, dessinées pour durer.', 1),
  ('convertibles','Convertibles',        'Le salon le jour, la chambre d''amis le soir.', 2),
  ('sculpturales','Pièces sculpturales', 'Des formes organiques, presque des œuvres.', 3);

with cat as (select id, slug from public.categories)
insert into public.products
  (slug, name, tagline, description, story, category_id, base_price, compare_at_price,
   width_cm, depth_cm, height_cm, seat_height_cm, seats, materials, frame, lead_time_weeks, is_featured)
values
  ('meandre', 'Méandre',
   'Canapé incurvé en bouclé',
   'Une longue courbe de bouclé blanc qui épouse la pièce plutôt que le mur. Son dossier ondulé dessine deux espaces de conversation ; on s''y installe de tous côtés.',
   'Dessiné pour les grands volumes : une pièce que l''on contourne, que l''on regarde, avant de s''y asseoir.',
   (select id from cat where slug = 'sculpturales'), 2990, null,
   240, 85, 66, 42, 4, 'Bouclé, mousse haute résilience', 'Bois massif', 6, true),

  ('petale', 'Pétale',
   'Fauteuil pivotant et son pouf',
   'Un fauteuil en pétales de bouclé posé sur une base pivotante en acier noir, livré avec son pouf assorti. On s''y love, puis on pivote vers la fenêtre ou vers la conversation.',
   'Chaque pétale est garni séparément pour soutenir le dos jusqu''à la nuque.',
   (select id from cat where slug = 'sculpturales'), 1290, null,
   100, 100, 70, 40, 1, 'Bouclé, garnissage coton et mousse — pouf Ø 60 × H 25 cm inclus', 'Base pivotante en acier laqué noir', 4, true),

  ('galet', 'Galet',
   'Canapé organique en laine d''agneau',
   'Un trois-places aux coussins bombés et aux accoudoirs sculptés, habillé d''une laine d''agneau bouclée. Sans un seul angle, il devient naturellement la pièce centrale du salon.',
   'Ses formes ont été dessinées à la main avant d''être sculptées dans la mousse.',
   (select id from cat where slug = 'sculpturales'), 2790, null,
   230, 95, 75, 42, 3, 'Sherpa (laine d''agneau synthétique), mousse haute résilience', 'Bois massif', 6, true),

  ('nuage', 'Nuage',
   'Canapé nuage, minimalisme nordique',
   'Des volumes arrondis qui s''enchaînent comme un nuage, recouverts d''un bouclé dense. Existe aussi en fauteuil (110 cm) et en deux-places (165 cm).',
   'Inspiré des intérieurs scandinaves : lumière, matière, et rien de superflu.',
   (select id from cat where slug = 'canapes'), 2190, 2490,
   190, 78, 85, 42, 3, 'Bouclé, mousse haute résilience', 'Bois massif', 5, true),

  ('alma', 'Alma',
   'Canapé droit en chénille, assise profonde',
   'Des coussins boudinés en chénille, 50 cm de profondeur d''assise et des appuie-tête relevables soulignés d''un liseré cognac. Alma se compose de 180 à 390 cm selon votre pièce.',
   'La pièce du quotidien : on s''y allonge, on y reçoit, on la garde vingt ans.',
   (select id from cat where slug = 'canapes'), 2390, null,
   240, 85, 80, 40, 4, 'Chénille, mousse haute résilience', 'Bois massif', 5, false),

  ('rive-gauche', 'Rive Gauche',
   'Convertible rétro en cuir huilé',
   'Un deux-places en cuir huilé-ciré au capitonnage généreux, qui se déplie en un lit de 200 × 150 cm. Son dossier s''incline sur cinq positions et ses accoudoirs cachent des poches de rangement.',
   'L''esprit des clubs américains des années 70, repensé pour les appartements d''aujourd''hui.',
   (select id from cat where slug = 'convertibles'), 1690, 1890,
   150, 76, 80, 42, 2, 'Cuir huilé-ciré, mousse haute résilience ou latex', 'Bois massif, pieds en acier inoxydable', 4, false);

-- Photos (public/products/<slug>/<n>.jpg) — la n°1 est la couverture détourée
insert into public.product_images (product_id, url, alt, position)
select p.id, '/products/' || p.slug || '/' || i.n || '.jpg', p.name || ' — ' || i.alt, i.n
  from public.products p
  join (values
    ('meandre', 1, 'trois vues du canapé incurvé'), ('meandre', 2, 'dans un salon classique'),
    ('petale', 1, 'fauteuil sur sa base pivotante'), ('petale', 2, 'dans un salon lumineux'), ('petale', 3, 'dimensions et pouf'),
    ('galet', 1, 'vue de face'), ('galet', 2, 'dans un salon'), ('galet', 3, 'avec ses fauteuils'),
    ('nuage', 1, 'canapé ivoire'), ('nuage', 2, 'fauteuil ivoire'), ('nuage', 3, 'fauteuil noir encre'), ('nuage', 4, 'canapé noir encre'),
    ('alma', 1, 'vue de trois-quarts'), ('alma', 2, 'en crème'), ('alma', 3, 'en sable'),
    ('alma', 4, 'en gris perle'), ('alma', 5, 'en vert forêt'), ('alma', 6, 'dimensions et compositions'),
    ('rive-gauche', 1, 'vue de trois-quarts'), ('rive-gauche', 2, 'dans un salon'), ('rive-gauche', 3, 'avec plaid'),
    ('rive-gauche', 4, 'versions une et deux places'), ('rive-gauche', 5, 'positions canapé, lit, méridienne'),
    ('rive-gauche', 6, 'dimensions')
  ) as i(slug, n, alt) on i.slug = p.slug;

-- Variantes (coloris) & stock ; img = photo correspondante dans la galerie
insert into public.product_variants (product_id, sku, color_name, color_hex, fabric, price_delta, stock, image_position, position)
select p.id, upper(left(replace(p.slug, '-', ''), 3)) || '-' || v.code, v.color, v.hex, v.fabric, v.delta, v.stock, v.img, v.pos
  from public.products p
  join (values
    ('meandre',    'IVO', 'Ivoire',       '#F1ECE2', 'Bouclé',                     0,   6, 1::smallint, 1),
    ('meandre',    'ECR', 'Écru',         '#E6DCCB', 'Bouclé',                     0,   4, null,        2),
    ('meandre',    'GRE', 'Grège',        '#C9BBA6', 'Bouclé',                   150,   2, null,        3),
    ('petale',     'CRE', 'Crème',        '#F1E9DC', 'Bouclé',                     0,   6, 1,           1),
    ('petale',     'ROS', 'Rose poudré',  '#E3C6BC', 'Bouclé',                     0,   4, null,        2),
    ('petale',     'BLE', 'Bleu ciel',    '#BFD0DD', 'Bouclé',                     0,   3, null,        3),
    ('petale',     'SAU', 'Sauge',        '#A9B29A', 'Bouclé',                     0,   3, null,        4),
    ('petale',     'GRI', 'Gris perle',   '#BDBAB4', 'Bouclé',                     0,   2, null,        5),
    ('galet',      'NEI', 'Neige',        '#F4F0E8', 'Sherpa',                     0,   4, 1,           1),
    ('galet',      'LIN', 'Lin',          '#D8CDBB', 'Sherpa',                     0,   3, null,        2),
    ('galet',      'CAR', 'Caramel',      '#B07A4F', 'Sherpa',                   200,   2, null,        3),
    ('nuage',      'IVO', 'Ivoire',       '#F3EEE4', 'Bouclé',                     0,   6, 1,           1),
    ('nuage',      'NOI', 'Noir encre',   '#1E1D1C', 'Bouclé',                     0,   3, 4,           2),
    ('alma',       'CRE', 'Crème',        '#EDE4D3', 'Chénille',                   0,  12, 2,           1),
    ('alma',       'SAB', 'Sable',        '#CBB9A0', 'Chénille',                   0,   7, 3,           2),
    ('alma',       'GRI', 'Gris perle',   '#B9B8B4', 'Chénille',                   0,   8, 4,           3),
    ('alma',       'VER', 'Vert forêt',   '#5E6F4E', 'Chénille',                   0,   4, 5,           4),
    ('rive-gauche','COG', 'Cognac',       '#9A5B33', 'Cuir huilé · mousse HR',     0,   8, 1,           1),
    ('rive-gauche','LAT', 'Cognac latex', '#9A5B33', 'Cuir huilé · latex naturel', 120, 4, 1,           2)
  ) as v(slug, code, color, hex, fabric, delta, stock, img, pos) on v.slug = p.slug;

-- Codes promo
insert into public.coupons (code, description, percent_off, amount_off, min_subtotal, max_uses, expires_at) values
  ('BIENVENUE10', '10 % sur votre première pièce',      10,   null, 0,    null, null),
  ('SALON200',    '200 € offerts dès 2 000 € d''achat', null, 200,  2000, 100,  now() + interval '6 months');
