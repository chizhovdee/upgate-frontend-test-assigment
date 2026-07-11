import type { FieldName, FieldState, FormState } from './types';

export const FIELD_NAMES: FieldName[] = ['cardNumber', 'email', 'cvv', 'expire'];

export const EMPTY_FIELD: FieldState = { value: '', touched: false };

export const INITIAL_STATE: FormState = {
  cardNumber: { ...EMPTY_FIELD },
  email: { ...EMPTY_FIELD },
  cvv: { ...EMPTY_FIELD },
  expire: { ...EMPTY_FIELD },
};

export const FIELD_CONFIG: Record<FieldName, { label: string; placeholder: string, type: string }> = {
  cardNumber: { label: 'Card number', placeholder: '4242 4242 4242 4242', type: 'text' },
  email: { label: 'Email', placeholder: 'you@example.com', type: 'email' },
  cvv: { label: 'CVV', placeholder: '123', type: 'text' },
  expire: { label: 'Validity period', placeholder: 'MM/YY', type: 'text' },
};
