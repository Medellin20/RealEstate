-- Registre unifié des formulaires envoyés depuis le site.
-- Chaque visite ou dossier de paiement de réservation y est conservé avec
-- les données saisies, indépendamment des tables métier associées.
create table if not exists public.request_submissions (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('viewing', 'reservation_payment')),
  source_id uuid not null,
  reference text not null unique,
  property_id uuid not null references public.properties(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete restrict,
  form_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists request_submissions_type_created_idx
  on public.request_submissions (request_type, created_at desc);

create index if not exists request_submissions_property_idx
  on public.request_submissions (property_id);

create index if not exists request_submissions_client_idx
  on public.request_submissions (client_id);

alter table public.request_submissions enable row level security;
