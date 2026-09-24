alter table bank_settings
  add column if not exists show_on_confirmations boolean not null default true;
