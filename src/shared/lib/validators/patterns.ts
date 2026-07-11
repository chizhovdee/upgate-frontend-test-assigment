export const PATTERNS = {
  cardNumber: /^\d{16}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  cvv: /^\d{3,4}$/,
  expire: /^(0[1-9]|1[0-2])\/\d{2}$/,
} as const;
