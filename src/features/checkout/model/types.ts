export type FieldName = 'cardNumber' | 'email' | 'cvv' | 'expire';

export interface FieldState {
  value: string;
  touched: boolean;
}

export type FormState = Record<FieldName, FieldState>;
