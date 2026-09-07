export function formatDutchPhoneInput(value: string, allowEmpty = false) {
  const digits = value.replace(/\D/g, '');
  if (allowEmpty && digits.length === 0) return '';

  const withoutCountryCode = digits
    .replace(/^0031/, '')
    .replace(/^31/, '')
    .replace(/^0/, '')
    .slice(0, 9);
  return `+31 ${withoutCountryCode}`;
}
