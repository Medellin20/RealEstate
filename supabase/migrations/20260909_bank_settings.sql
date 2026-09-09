-- Coordonnées bancaires utilisées pour les frais de visite et les garanties.
-- Le BIC reste facultatif lorsque l'IBAN suffit pour le virement.
update bank_settings
set
  beneficiary_name = 'NICOLE PROBST',
  iban = 'NL29 BUNQ 2211 9006 31',
  bic = '',
  bank_name = 'BUNQ',
  updated_at = now()
where id = 1;
