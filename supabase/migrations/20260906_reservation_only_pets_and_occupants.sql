-- Les animaux et le nombre d’occupants sont des informations du dossier de réservation.
alter table public.reservations
  add column if not exists has_pets boolean not null default false;

alter table public.viewing_requests
  drop column if exists occupants_count;

alter table public.properties
  drop column if exists pets_allowed;
