import { PATTERNS } from './patterns';

export type ValidationError = string | null;

export function normalizeCardNumber(value: string): string {
  return value.replace(/\s+/g, '');
}

export function validateCardNumber(value: string): ValidationError {
  return PATTERNS.cardNumber.test(normalizeCardNumber(value))
    ? null
    : 'The card number must contain 16 digits.';
}

export function validateEmail(value: string): ValidationError {
  return PATTERNS.email.test(value) ? null : 'Enter a valid email';
}

export function validateCvv(value: string): ValidationError {
  return PATTERNS.cvv.test(value) ? null : 'CVV must be 3 or 4 digits';
}

export function validateExpire(value: string): ValidationError {
  return PATTERNS.expire.test(value) ? null : 'Expiration Format - MM/YY';
}
