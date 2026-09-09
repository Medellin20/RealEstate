create table if not exists site_settings (
  id integer primary key default 1 check (id = 1),
  footer_phone text not null default '+31649496257',
  updated_at timestamptz not null default now()
);

insert into site_settings (id, footer_phone)
values (1, '+31649496257')
on conflict (id) do nothing;

alter table site_settings enable row level security;

create policy "public_read_site_settings"
  on site_settings for select
  to anon, authenticated
  using (true);
