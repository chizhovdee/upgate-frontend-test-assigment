import { useState } from 'react';
import type { FieldName, FormState } from './types';
import { FIELD_NAMES, INITIAL_STATE } from './constants';

// const VALIDATORS: Record<FieldName, (value: string) => string | null> = {
//   cardNumber: (value: string) => null,
//   email: (value: string) => null,
//   cvv: (value: string) => null,
//   expire: (value: string) => null,
// };

export function useForm() {
  const [fields, setFields] = useState<FormState>(INITIAL_STATE);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors = {} as Record<FieldName, string | null>;

  const isValid = FIELD_NAMES.every((name) => errors[name] === null);
  const isDirty = FIELD_NAMES.some((name) => fields[name].value !== '');

  return {
    isValid,
    isDirty,
    getValue: (field: FieldName) => fields[field].value,
    setValue: (name: FieldName, value: string) => {
      setFields((current) => ({ ...current, [name]: { ...current[name], value } }));
    },
    setTouched: (name: FieldName) => {
      setFields((current) => ({ ...current, [name]: { ...current[name], touched: true } }));
    },
    getError: (field: FieldName) => errors[field],
    shouldShowError: (name: FieldName) =>
      (fields[name].touched || submitAttempted) && errors[name] !== null,
    submit: () => setSubmitAttempted(true),
  };
}
