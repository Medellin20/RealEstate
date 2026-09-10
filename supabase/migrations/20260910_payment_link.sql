alter table site_settings
  add column if not exists payment_link text not null default 'https://bunq.me/EtelaHorvathova';
