-- Keep the payment confirmation number aligned with the site's contact number.
alter table site_settings
  alter column footer_phone set default '+31684130011';

update site_settings
set footer_phone = '+31684130011'
where id = 1
  and footer_phone = '+31649496257';
