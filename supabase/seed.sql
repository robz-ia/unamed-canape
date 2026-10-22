-- =====================================================================
--  Unamed Canapé. — Catalogue initial
--  Rejouable : supprime puis réinsère le catalogue.
-- =====================================================================

delete from public.products;
delete from public.categories;
delete from public.coupons where code in ('BIENVENUE10', 'SALON200');

insert into public.categories (slug, name, description, cover_url, position) values
  ('canapes',      'Canapés',      'Des assises profondes, dessinées pour durer.',      '/products/alma/2.jpg',        1),
  ('fauteuils',    'Fauteuils',    'Une place à soi, pour lire, pivoter, s''y lover.',  '/products/petale/2.jpg',      2),
  ('convertibles', 'Convertibles', 'Le salon le jour, la chambre d''amis le soir.',     '/products/rive-gauche/6.jpg', 3);

with cat as (select id, slug from public.categories)
insert into public.products
  (slug, name, tagline, description, story, category_id, base_price, compare_at_price,
   width_cm, depth_cm, height_cm, seat_height_cm, seats, materials, frame, lead_time_weeks,
   option1_name, option2_name, is_featured)
values
  ('meandre', 'Méandre',
   'Canapé incurvé en bouclé',
   'Une longue courbe de bouclé ivoire qui épouse la pièce plutôt que le mur. Son dossier ondulé dessine deux espaces de conversation ; on s''y installe de tous côtés. Trois longueurs : 180, 210 ou 240 cm.',
   'Dessiné pour les grands volumes : une pièce que l''on contourne, que l''on regarde, avant de s''y asseoir.',
   (select id from cat where slug = 'canapes'), 2390, null,
   240, 85, 66, 42, 4, 'Bouclé ivoire, mousse haute résilience', 'Bois massif', 6,
   'Longueur', null, true),

  ('petale', 'Pétale',
   'Fauteuil pivotant et son pouf',
   'Un fauteuil en pétales de bouclé posé sur une base pivotante en acier noir, livré avec son pouf assorti. On s''y love, puis on pivote vers la fenêtre ou vers la conversation.',
   'Chaque pétale est garni séparément pour soutenir le dos jusqu''à la nuque.',
   (select id from cat where slug = 'fauteuils'), 1290, null,
   100, 100, 70, 40, 1, 'Bouclé, garnissage coton et mousse — pouf Ø 60 × H 25 cm inclus', 'Base pivotante en acier laqué noir', 4,
   'Coloris', null, true),

  ('galet', 'Galet',
   'Canapé organique en laine d''agneau',
   'Un trois-places aux coussins bombés et aux accoudoirs sculptés, habillé d''une laine d''agneau bouclée. Sans un seul angle, il devient naturellement la pièce centrale du salon.',
   'Ses formes ont été dessinées à la main avant d''être sculptées dans la mousse.',
   (select id from cat where slug = 'canapes'), 2790, null,
   230, 95, 75, 42, 3, 'Sherpa (laine d''agneau synthétique), mousse haute résilience', 'Bois massif', 6,
   'Coloris', null, true),

  ('nuage', 'Nuage',
   'Canapé nuage, minimalisme nordique',
   'Des volumes arrondis qui s''enchaînent comme un nuage, recouverts d''un bouclé dense. En canapé de 190 cm ou en fauteuil de 110 cm, en ivoire ou en noir encre.',
   'Inspiré des intérieurs scandinaves : lumière, matière, et rien de superflu.',
   (select id from cat where slug = 'canapes'), 1290, null,
   190, 78, 85, 42, 3, 'Bouclé, mousse haute résilience', 'Bois massif', 5,
   'Format', 'Coloris', true),

  ('alma', 'Alma',
   'Canapé droit en chénille, assise profonde',
   'Des coussins boudinés en chénille, 50 cm de profondeur d''assise et des appuie-tête relevables soulignés d''un liseré cognac. En trois places (210 cm) ou quatre places (280 cm).',
   'La pièce du quotidien : on s''y allonge, on y reçoit, on la garde vingt ans.',
   (select id from cat where slug = 'canapes'), 2390, null,
   210, 85, 80, 40, 3, 'Chénille, mousse haute résilience', 'Bois massif', 5,
   'Longueur', 'Coloris', false),

  ('rive-gauche', 'Rive Gauche',
   'Convertible rétro en cuir huilé',
   'Un convertible en cuir huilé-ciré au capitonnage généreux. La version deux places se déplie en un lit de 200 × 150 cm ; son dossier s''incline sur cinq positions et ses accoudoirs cachent des poches de rangement.',
   'L''esprit des clubs américains des années 70, repensé pour les appartements d''aujourd''hui.',
   (select id from cat where slug = 'convertibles'), 1190, null,
   150, 76, 80, 42, 2, 'Cuir huilé-ciré', 'Bois massif, pieds en acier inoxydable', 4,
   'Format', 'Garnissage', false);

-- Appartenance aux catégories (un produit peut être dans plusieurs, selon sa configuration)
insert into public.product_categories (product_id, category_id, option1)
select p.id, c.id, m.o1
  from (values
    ('meandre',     'canapes',      null),
    ('galet',       'canapes',      null),
    ('alma',        'canapes',      null),
    ('nuage',       'canapes',      'Canapé 190 cm'),
    ('rive-gauche', 'canapes',      'Deux places'),
    ('petale',      'fauteuils',    null),
    ('nuage',       'fauteuils',    'Fauteuil 110 cm'),
    ('rive-gauche', 'fauteuils',    'Une place'),
    ('rive-gauche', 'convertibles', null)
  ) as m(slug, cat, o1)
  join public.products p on p.slug = m.slug
  join public.categories c on c.slug = m.cat;

-- Photos (public/products/<slug>/<n>.jpg). option1/option2 : photo propre à une option, sinon commune.
insert into public.product_images (product_id, url, alt, option1, option2, on_white, position)
select p.id, '/products/' || p.slug || '/' || i.n || '.jpg', p.name || ' — ' || i.alt, i.o1, i.o2, i.white, i.n
  from public.products p
  join (values
    ('meandre',     1, 'trois vues du canapé incurvé',        null,            null, true),
    ('meandre',     2, 'dans un salon classique',             null,            null, false),
    ('petale',      1, 'fauteuil sur sa base pivotante',      null,            null, true),
    ('petale',      2, 'dans un salon lumineux',              null,            null, false),
    ('petale',      3, 'dimensions et pouf',                  null,            null, true),
    ('galet',       1, 'vue de face',                         null,            null, true),
    ('galet',       2, 'dans un salon',                       null,            null, false),
    ('galet',       3, 'avec ses fauteuils',                  null,            null, false),
    ('nuage',       1, 'canapé ivoire',                       'Canapé 190 cm', 'Ivoire', false),
    ('nuage',       2, 'fauteuil ivoire',                     'Fauteuil 110 cm', 'Ivoire', false),
    ('nuage',       3, 'fauteuil noir encre',                 'Fauteuil 110 cm', 'Noir encre', false),
    ('nuage',       4, 'canapé noir encre',                   'Canapé 190 cm', 'Noir encre', false),
    ('alma',        1, 'en crème, vue de trois-quarts',       null,            'Crème', true),
    ('alma',        2, 'en crème dans un salon',              null,            'Crème', false),
    ('alma',        3, 'en sable',                            null,            'Sable', false),
    ('alma',        4, 'en gris perle',                       null,            'Gris perle', false),
    ('alma',        5, 'en vert forêt',                       null,            'Vert forêt', false),
    ('alma',        6, 'dimensions et compositions',          null,            null, true),
    ('rive-gauche', 1, 'deux places, vue de trois-quarts',    'Deux places',   null, true),
    ('rive-gauche', 2, 'une place dans un salon',             'Une place',     null, false),
    ('rive-gauche', 3, 'deux places avec plaid',              'Deux places',   null, false),
    ('rive-gauche', 4, 'versions une et deux places',         'Une place',     null, true),
    ('rive-gauche', 5, 'deux places en position canapé',      'Deux places',   null, false),
    ('rive-gauche', 6, 'deux places déplié en lit',           'Deux places',   null, false),
    ('rive-gauche', 7, 'deux places en méridienne',           'Deux places',   null, false),
    ('rive-gauche', 8, 'dimensions du deux places',           'Deux places',   null, true)
  ) as i(slug, n, alt, o1, o2, white) on i.slug = p.slug;

-- Variantes (combinaisons d'options) & stock
insert into public.product_variants (product_id, sku, option1, option2, swatch_hex, price_delta, stock, is_default, position)
select p.id, upper(left(replace(p.slug, '-', ''), 3)) || '-' || v.code, v.o1, v.o2, v.hex, v.delta, v.stock, v.def, v.pos
  from public.products p
  join (values
    ('meandre',     '180',     '180 cm',          null,          null,        0, 4, false,  1),
    ('meandre',     '210',     '210 cm',          null,          null,      300, 4, false,  2),
    ('meandre',     '240',     '240 cm',          null,          null,      600, 5, true,   3),
    ('petale',      'CRE',     'Crème',           null,          '#F1E9DC',   0, 8, true,   1),
    ('galet',       'NEI',     'Neige',           null,          '#F4F0E8',   0, 6, true,   1),
    ('nuage',       'CAN-IVO', 'Canapé 190 cm',   'Ivoire',      '#F3EEE4', 900, 5, true,   1),
    ('nuage',       'CAN-NOI', 'Canapé 190 cm',   'Noir encre',  '#1E1D1C', 900, 3, false,  2),
    ('nuage',       'FAU-IVO', 'Fauteuil 110 cm', 'Ivoire',      '#F3EEE4',   0, 6, false,  3),
    ('nuage',       'FAU-NOI', 'Fauteuil 110 cm', 'Noir encre',  '#1E1D1C',   0, 4, false,  4),
    ('alma',        '210-CRE', '210 cm · 3 places', 'Crème',      '#EDE4D3',   0, 8, true,   1),
    ('alma',        '210-SAB', '210 cm · 3 places', 'Sable',      '#CBB9A0',   0, 5, false,  2),
    ('alma',        '210-GRI', '210 cm · 3 places', 'Gris perle', '#B9B8B4',   0, 6, false,  3),
    ('alma',        '210-VER', '210 cm · 3 places', 'Vert forêt', '#5E6F4E',   0, 3, false,  4),
    ('alma',        '280-CRE', '280 cm · 4 places', 'Crème',      '#EDE4D3', 700, 4, false,  5),
    ('alma',        '280-SAB', '280 cm · 4 places', 'Sable',      '#CBB9A0', 700, 2, false,  6),
    ('alma',        '280-GRI', '280 cm · 4 places', 'Gris perle', '#B9B8B4', 700, 3, false,  7),
    ('alma',        '280-VER', '280 cm · 4 places', 'Vert forêt', '#5E6F4E', 700, 1, false,  8),
    ('rive-gauche', '2P-MOU',  'Deux places',     'Mousse haute résilience', null, 500, 8, true,  1),
    ('rive-gauche', '2P-LAT',  'Deux places',     'Latex naturel',           null, 620, 4, false, 2),
    ('rive-gauche', '1P-MOU',  'Une place',       'Mousse haute résilience', null,   0, 6, false, 3),
    ('rive-gauche', '1P-LAT',  'Une place',       'Latex naturel',           null, 120, 3, false, 4)
  ) as v(slug, code, o1, o2, hex, delta, stock, def, pos) on v.slug = p.slug;

-- Codes promo
insert into public.coupons (code, description, percent_off, amount_off, min_subtotal, max_uses, expires_at) values
  ('BIENVENUE10', '10 % sur votre première pièce',      10,   null, 0,    null, null),
  ('SALON200',    '200 € offerts dès 2 000 € d''achat', null, 200,  2000, 100,  now() + interval '6 months');
