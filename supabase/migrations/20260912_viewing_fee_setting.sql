alter table site_settings
  add column if not exists viewing_fee numeric(10, 2) not null default 50;
