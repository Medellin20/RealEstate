alter table site_settings
  add column if not exists show_payment_link boolean not null default true;
