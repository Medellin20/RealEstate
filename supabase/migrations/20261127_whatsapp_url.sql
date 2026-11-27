alter table site_settings
  add column if not exists whatsapp_url text not null default 'https://wa.me/31626512097';
