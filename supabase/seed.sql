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
  ('montaigne', 'Montaigne',
   'Canapé-lit pour les appartements de ville',
   'Un canapé trois places aux lignes tendues qui se déplie en un vrai lit de 140 × 195 cm. Le mécanisme est invisible, l''assise reste ferme et généreuse au quotidien.',
   'Pensé pour les surfaces parisiennes où chaque mètre compte : un seul meuble, deux usages, aucun compromis sur l''allure.',
   (select id from cat where slug = 'convertibles'), 1890, 2190,
   210, 95, 82, 44, 3, 'Bouclé de laine et polyester recyclé, mousse haute résilience 35 kg/m³', 'Hêtre massif et acier', 5, true),

  ('rive-gauche', 'Rive Gauche',
   'Convertible rétro aux accents seventies',
   'Un convertible multifonction inspiré du mobilier américain des années 70. Il passe de canapé à méridienne puis à couchage d''appoint en un geste.',
   'Une silhouette basse et décontractée, pour les salons qui aiment recevoir tard.',
   (select id from cat where slug = 'convertibles'), 1490, null,
   195, 92, 78, 42, 3, 'Velours épais, garnissage plumes et mousse', 'Pin massif, piètement noyer', 4, false),

  ('petale', 'Pétale',
   'Canapé design aux courbes de fleur',
   'Des coussins en pétales qui s''ouvrent autour de l''assise. Une pièce de designer, douce et graphique, qui transforme un salon en galerie.',
   'Chaque pétale est garni et cousu à la main dans notre atelier partenaire, puis assemblé un à un.',
   (select id from cat where slug = 'sculpturales'), 2690, null,
   230, 105, 74, 40, 3, 'Chenille crème, plumes et mousse à mémoire de forme', 'Bois massif lamellé-collé', 7, true),

  ('galet', 'Galet',
   'Canapé organique en laine d''agneau',
   'Une forme irrégulière, comme polie par l''eau. Habillé d''une laine d''agneau bouclée, le Galet se pose au centre de la pièce et s''admire sous tous les angles.',
   'Aucune ligne droite : le Galet a été dessiné à la main avant d''être sculpté dans la mousse.',
   (select id from cat where slug = 'sculpturales'), 3190, null,
   260, 120, 72, 41, 4, 'Laine d''agneau bouclée (fausse fourrure premium), mousse sculptée', 'Contreplaqué de bouleau', 8, true),

  ('alma', 'Alma',
   'Canapé droit en chénille',
   'Un canapé droit d''une grande sobriété, recouvert d''une chénille au toucher velouté. Ses coussins déhoussables et son assise profonde en font la pièce du quotidien.',
   'La pièce que l''on garde vingt ans : intemporelle, robuste, facile à vivre.',
   (select id from cat where slug = 'canapes'), 2290, null,
   240, 100, 80, 43, 4, 'Chénille 450 g/m², garnissage plumes et mousse', 'Hêtre massif', 5, false),

  ('nuage', 'Nuage',
   'Canapé cloud, minimalisme nordique',
   'Le confort d''un nuage dans une silhouette nordique épurée. Ses modules profonds invitent à s''y enfoncer, ses volumes généreux restent d''une élégance absolue.',
   'Inspiré des intérieurs scandinaves : lumière, matière, et rien de superflu.',
   (select id from cat where slug = 'canapes'), 2890, 3290,
   280, 110, 70, 42, 4, 'Bouclé crème, garnissage plumes et ouate', 'Pin nordique massif', 6, true);

-- Images : 3 vues par produit dans /public/products/<slug>/
insert into public.product_images (product_id, url, alt, position)
select p.id, '/products/' || p.slug || '/' || n || '.jpg',
       p.name || ' — ' || case n when 1 then 'vue de face' when 2 then 'vue de trois-quarts' else 'détail de la matière' end,
       n
  from public.products p cross join generate_series(1, 3) as n;

-- Variantes (coloris) & stock
insert into public.product_variants (product_id, sku, color_name, color_hex, fabric, price_delta, stock, position)
select p.id, upper(left(p.slug, 3)) || '-' || v.code, v.color, v.hex, v.fabric, v.delta, v.stock, v.pos
  from public.products p
  join (values
    ('montaigne',  'IVO', 'Ivoire',      '#EEE8DC', 'Bouclé',          0,   12, 1),
    ('montaigne',  'GRE', 'Grège',       '#C9BBA6', 'Bouclé',          0,    6, 2),
    ('montaigne',  'ANT', 'Anthracite',  '#3B3A38', 'Bouclé',        120,    3, 3),
    ('rive-gauche','COG', 'Cognac',      '#9A5B33', 'Velours',         0,    8, 1),
    ('rive-gauche','CRE', 'Crème',       '#EFE6D6', 'Velours',         0,   10, 2),
    ('rive-gauche','OLI', 'Olive',       '#6B6A45', 'Velours',        90,    2, 3),
    ('petale',     'CRE', 'Crème',       '#F1E9DC', 'Chénille',        0,    5, 1),
    ('petale',     'ROS', 'Rose poudré', '#E3C6BC', 'Chénille',      150,    4, 2),
    ('petale',     'SAU', 'Sauge',       '#A9B29A', 'Chénille',      150,    3, 3),
    ('galet',      'NEI', 'Neige',       '#F6F3EE', 'Laine d''agneau', 0,    4, 1),
    ('galet',      'LIN', 'Lin',         '#D8CDBB', 'Laine d''agneau', 0,    3, 2),
    ('galet',      'CAR', 'Caramel',     '#B07A4F', 'Laine d''agneau', 200,  2, 3),
    ('alma',       'CRE', 'Crème',       '#EDE4D3', 'Chénille',        0,   14, 1),
    ('alma',       'TAU', 'Taupe',       '#8C7B6B', 'Chénille',        0,    9, 2),
    ('alma',       'PER', 'Gris perle',  '#BDBAB4', 'Chénille',        0,    7, 3),
    ('nuage',      'IVO', 'Ivoire',      '#F3EEE4', 'Bouclé',          0,    6, 1),
    ('nuage',      'SAB', 'Sable',       '#D6C3A5', 'Bouclé',          0,    5, 2),
    ('nuage',      'BRU', 'Gris brume',  '#A7A5A0', 'Bouclé',        180,    1, 3)
  ) as v(slug, code, color, hex, fabric, delta, stock, pos) on v.slug = p.slug;

-- Codes promo
insert into public.coupons (code, description, percent_off, amount_off, min_subtotal, max_uses, expires_at) values
  ('BIENVENUE10', '10 % sur votre première pièce',      10,   null, 0,    null, null),
  ('SALON200',    '200 € offerts dès 2 000 € d''achat', null, 200,  2000, 100,  now() + interval '6 months');
