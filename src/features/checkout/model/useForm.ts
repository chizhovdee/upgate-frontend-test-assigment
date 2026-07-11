import { useMemo, useState } from 'react';
import type { FieldName, FormState } from './types';
import { FIELD_NAMES, INITIAL_STATE } from './constants';
import {
  validateCardNumber,
  validateCvv,
  validateEmail,
  validateExpire,
} from 'shared/lib/validators';

const VALIDATORS: Record<FieldName, (value: string) => string | null> = {
  cardNumber: validateCardNumber,
  email: validateEmail,
  cvv: validateCvv,
  expire: validateExpire,
};

interface Form {
  isDirty: boolean;
  isValid: boolean;
  getValue: (field: FieldName) => string;
  setValue: (name: FieldName, value: string) => void;
  setTouched: (name: FieldName) => void;
  getError: (field: FieldName) => string | null;
  shouldShowError: (name: FieldName) => boolean;
  submit: () => void;
}

export function useForm(): Form {
  const [fields, setFields] = useState<FormState>(INITIAL_STATE);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors = useMemo(() => {
    return FIELD_NAMES.reduce(
      (acc, name) => {
        acc[name] = VALIDATORS[name](fields[name].value);
        return acc;
      },
      {} as Record<FieldName, string | null>,
    );
  }, [fields]);

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
