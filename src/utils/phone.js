// Uzbek local numbers are shown as "90 123 45 67" (2-3-2-2 groups) after the
// fixed +998 prefix; the API stores digits with the country code ("998901234567").
export const formatPhoneDigits = (digits) =>
  [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)]
    .filter(Boolean)
    .join(' ')
