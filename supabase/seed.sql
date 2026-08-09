-- =============================================================================
-- REAL ESTATE NL — DONNÉES DE DÉMONSTRATION
-- À exécuter après schema.sql et rls_policies.sql
-- Utilise la service role (SQL Editor Supabase l'exécute déjà avec les
-- droits nécessaires, RLS n'entre pas en jeu ici).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- AMENITIES
-- -----------------------------------------------------------------------------

insert into amenities (key, label_fr, icon) values
  ('wifi', 'Wi-Fi', 'Wifi'),
  ('heating', 'Chauffage', 'Flame'),
  ('equipped_kitchen', 'Cuisine équipée', 'CookingPot'),
  ('washing_machine', 'Machine à laver', 'WashingMachine'),
  ('dishwasher', 'Lave-vaisselle', 'Utensils'),
  ('parking', 'Parking', 'SquareParking'),
  ('balcony', 'Balcon', 'DoorOpen'),
  ('elevator', 'Ascenseur', 'ArrowUpDown'),
  ('garden', 'Jardin', 'Trees'),
  ('cellar', 'Cave', 'Warehouse'),
  ('bike_storage', 'Local à vélos', 'Bike'),
  ('air_conditioning', 'Climatisation', 'Wind')
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- PROPERTIES DE DÉMONSTRATION
-- -----------------------------------------------------------------------------

insert into properties (
  slug, title, description, property_type, address, city, postal_code, neighborhood,
  latitude, longitude, monthly_price, service_charges, deposit_amount, viewing_fee,
  surface_m2, bedrooms, bathrooms, rooms, floor, has_elevator, has_balcony, has_terrace,
  has_parking, has_garden, is_furnished, pets_allowed, available_from, minimum_stay_months,
  status, is_published, is_featured
) values
(
  'amsterdam-modern-apartment-centrum',
  'Appartement moderne au cœur du Centrum',
  'Superbe appartement entièrement rénové situé au cœur du centre historique d''Amsterdam, à deux pas des canaux et des principales attractions. Cet appartement lumineux combine le charme d''un immeuble du XVIIe siècle avec des finitions contemporaines : cuisine ouverte équipée, grandes fenêtres à guillotine et parquet d''origine restauré. Idéal pour un professionnel ou un couple souhaitant vivre au centre névralgique de la ville.',
  'appartement', 'Herengracht 45', 'Amsterdam', '1015 BB', 'Centrum',
  52.372760, 4.893604, 1950, 175, 3900, 45,
  62, 1, 1, 3, 2, false, false, false,
  false, false, true, false, current_date + interval '14 days', 12,
  'available', true, true
),
(
  'amsterdam-family-flat-de-pijp',
  'Appartement familial lumineux à De Pijp',
  'Grand appartement familial dans le quartier animé et convivial de De Pijp, réputé pour son marché Albert Cuyp et ses nombreux cafés. Trois chambres spacieuses, un double séjour baigné de lumière et un balcon orienté sud. Quartier très bien desservi par le tram, à 10 minutes du centre.',
  'appartement', 'Ferdinand Bolstraat 112', 'Amsterdam', '1072 LC', 'De Pijp',
  52.354490, 4.893330, 2450, 210, 4900, 45,
  98, 3, 1, 4, 1, false, true, false,
  false, false, false, true, current_date + interval '30 days', 12,
  'available', true, false
),
(
  'rotterdam-loft-kop-van-zuid',
  'Loft design à Kop van Zuid',
  'Loft d''architecte au sein d''un ancien entrepôt portuaire réhabilité, avec vue imprenable sur la Maas et le Erasmusbrug. Volumes généreux, hauteur sous plafond exceptionnelle, cuisine ouverte haut de gamme et grande baie vitrée. Un cadre de vie unique dans l''un des quartiers les plus dynamiques de Rotterdam.',
  'loft', 'Wilhelminakade 88', 'Rotterdam', '3072 AP', 'Kop van Zuid',
  51.906900, 4.488500, 2100, 195, 4200, 40,
  85, 2, 2, 3, 6, true, true, false,
  true, false, true, false, current_date + interval '7 days', 6,
  'available', true, true
),
(
  'rotterdam-studio-centrum',
  'Studio pratique en plein centre de Rotterdam',
  'Studio fonctionnel et bien agencé, à distance de marche de la gare centrale de Rotterdam et du quartier des affaires. Parfait pour un jeune actif ou un étudiant en échange. Immeuble sécurisé avec ascenseur et local à vélos.',
  'studio', 'Coolsingel 22', 'Rotterdam', '3011 AD', 'Centrum',
  51.922300, 4.479800, 1150, 95, 2300, 30,
  32, 1, 1, 1, 3, true, false, false,
  false, false, true, false, current_date + interval '3 days', 6,
  'available', true, false
),
(
  'utrecht-canal-house-binnenstad',
  'Maison de canal charmante à Binnenstad',
  'Ravissante maison de canal typiquement néerlandaise, avec sa façade à pignon et son escalier caractéristique. Salon traditionnel avec poutres apparentes, cuisine récemment rénovée et petit jardin arrière. Emplacement idéal à deux pas de la cathédrale Dom et du Oudegracht.',
  'maison', 'Oudegracht 210', 'Utrecht', '3511 NR', 'Binnenstad',
  52.090740, 5.121400, 2650, 180, 5300, 45,
  110, 3, 2, 5, 0, false, false, true,
  false, true, false, true, current_date + interval '45 days', 12,
  'reserved', true, false
),
(
  'utrecht-studio-wittevrouwen',
  'Studio cosy à Wittevrouwen',
  'Petit studio chaleureux dans le quartier résidentiel prisé de Wittevrouwen, à proximité du parc Griftpark. Cuisine compacte entièrement équipée et salle de bain moderne. Quartier calme, parfait pour se ressourcer tout en restant proche du centre à vélo.',
  'studio', 'Nachtegaalstraat 18', 'Utrecht', '3581 AD', 'Wittevrouwen',
  52.095600, 5.130800, 1050, 85, 2100, 30,
  28, 1, 1, 1, 1, false, false, false,
  false, false, true, false, current_date + interval '10 days', 6,
  'available', true, false
),
(
  'eindhoven-duplex-strijp-s',
  'Duplex contemporain à Strijp-S',
  'Duplex design situé dans l''ancien complexe industriel Philips reconverti de Strijp-S, aujourd''hui quartier créatif emblématique d''Eindhoven. Deux niveaux, mezzanine ouverte, matériaux bruts et grandes ouvertures. Environnement dynamique entre startups, galeries et cafés.',
  'duplex', 'Torenallee 40', 'Eindhoven', '5617 BD', 'Strijp-S',
  51.449700, 5.454900, 1750, 150, 3500, 40,
  75, 2, 1, 3, 2, true, true, false,
  true, false, true, false, current_date + interval '20 days', 12,
  'available', true, true
),
(
  'the-hague-apartment-statenkwartier',
  'Appartement élégant à Statenkwartier',
  'Bel appartement dans le quartier huppé et verdoyant de Statenkwartier à La Haye, à proximité des ambassades et du Vredespaleis. Belles proportions, moulures d''époque conservées et double exposition. Quartier calme et arboré, très prisé des familles et expatriés.',
  'appartement', 'Nassaulaan 5', 'The Hague', '2514 JS', 'Statenkwartier',
  52.089700, 4.288100, 2200, 190, 4400, 45,
  90, 2, 2, 4, 1, true, true, false,
  false, false, false, true, current_date + interval '25 days', 12,
  'available', true, false
),
(
  'the-hague-studio-centrum',
  'Studio moderne près de la gare centrale',
  'Studio récemment rénové à quelques minutes à pied de la gare centrale de La Haye. Idéal pour les trajets fréquents vers Amsterdam ou Rotterdam. Cuisine compacte équipée et rangements optimisés.',
  'studio', 'Herderstraat 12', 'The Hague', '2511 TP', 'Centrum',
  52.081100, 4.324200, 1050, 90, 2100, 30,
  30, 1, 1, 1, 4, true, false, false,
  false, false, true, false, current_date + interval '5 days', 6,
  'rented', true, false
),
(
  'groningen-apartment-binnenstad',
  'Appartement étudiant/jeune actif à Binnenstad',
  'Appartement agréable en plein centre historique de Groningue, ville universitaire animée. Proche de tous les commerces, bars et de l''université. Bien entretenu, lumineux, avec une kitchenette moderne.',
  'appartement', 'Oude Kijk in ''t Jatstraat 34', 'Groningen', '9712 EK', 'Binnenstad',
  53.219400, 6.566500, 950, 80, 1900, 25,
  45, 2, 1, 2, 2, false, false, false,
  false, false, true, true, current_date + interval '12 days', 12,
  'available', true, false
),
(
  'groningen-loft-noorderplantsoen',
  'Loft atypique près du Noorderplantsoen',
  'Loft atypique aménagé dans une ancienne fabrique, à deux pas du magnifique parc Noorderplantsoen. Grand espace de vie modulable, verrière apportant une lumière naturelle abondante. Un bien rare pour Groningue.',
  'loft', 'Violenstraat 9', 'Groningen', '9713 EE', 'Noorderplantsoen',
  53.224800, 6.560300, 1400, 110, 2800, 35,
  70, 2, 1, 3, 0, false, false, true,
  false, true, false, false, current_date + interval '18 days', 12,
  'available', true, false
),
(
  'amsterdam-oost-apartment-brouwer',
  'Appartement chaleureux à Amsterdam-Oost',
  'Appartement plein de charme dans le quartier en plein essor d''Amsterdam-Oost, proche du parc Oosterpark et du Tropenmuseum. Cuisine ouverte récemment refaite, chambre spacieuse et belle luminosité en fin de journée.',
  'appartement', 'Linnaeusstraat 78', 'Amsterdam', '1092 DK', 'Oost',
  52.360900, 4.929800, 1650, 140, 3300, 40,
  55, 1, 1, 2, 3, false, true, false,
  false, false, true, false, current_date + interval '9 days', 12,
  'available', true, false
);

-- -----------------------------------------------------------------------------
-- IMAGES DE DÉMONSTRATION
-- Utilise des photos libres de droit (Unsplash) le temps que de vraies
-- photos soient uploadées via Supabase Storage depuis l'admin.
-- -----------------------------------------------------------------------------

insert into property_images (property_id, storage_path, url, alt_text, is_primary, sort_order)
select p.id, 'seed/' || p.slug || '-1.jpg', img.url, p.title, img.is_primary, img.sort_order
from properties p
join lateral (
  values
    ('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80', true, 0),
    ('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80', false, 1),
    ('https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80', false, 2),
    ('https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&q=80', false, 3)
) as img(url, is_primary, sort_order) on true;

-- -----------------------------------------------------------------------------
-- ÉQUIPEMENTS PAR LOGEMENT (échantillon représentatif)
-- -----------------------------------------------------------------------------

insert into property_amenities (property_id, amenity_id)
select p.id, a.id
from properties p
cross join amenities a
where a.key in ('wifi', 'heating', 'equipped_kitchen', 'washing_machine')
on conflict do nothing;

insert into property_amenities (property_id, amenity_id)
select p.id, a.id
from properties p
join amenities a on a.key = 'elevator'
where p.has_elevator = true
on conflict do nothing;

insert into property_amenities (property_id, amenity_id)
select p.id, a.id
from properties p
join amenities a on a.key = 'parking'
where p.has_parking = true
on conflict do nothing;

insert into property_amenities (property_id, amenity_id)
select p.id, a.id
from properties p
join amenities a on a.key = 'balcony'
where p.has_balcony = true
on conflict do nothing;

insert into property_amenities (property_id, amenity_id)
select p.id, a.id
from properties p
join amenities a on a.key = 'garden'
where p.has_garden = true
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- Configuration bancaire de démonstration (à modifier depuis /admin)
-- -----------------------------------------------------------------------------

update bank_settings set
  beneficiary_name = 'Real Estate NL B.V.',
  iban = 'NL91 ABNA 0417 1643 00',
  bic = 'ABNANL2A',
  bank_name = 'ABN AMRO Bank N.V.',
  payment_instructions = 'Veuillez impérativement indiquer la référence de garantie fournie (ex : GUARANTEE-REN-000123) dans le libellé de votre virement. Le traitement peut prendre 2 à 3 jours ouvrés après réception.',
  default_deposit_amount = 1500
where id = 1;
