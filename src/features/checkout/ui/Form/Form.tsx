import { FormField } from 'shared/ui/FormField';

import styles from './Form.module.css';
import { FIELD_NAMES, FIELD_CONFIG } from 'features/checkout/model/constants';
import { useForm } from 'features/checkout/model/useForm';
import { useSubmitPayment } from 'features/checkout/api/useSubmitPayment';

export function Form() {
  const form = useForm();
  const submitPayment = useSubmitPayment();

  const handleSubmit = () => {};

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {FIELD_NAMES.map((name) => (
        <FormField
          key={name}
          label={FIELD_CONFIG[name].label}
          type={FIELD_CONFIG[name].type}
          name={name}
          value={form.getValue(name)}
          error={form.shouldShowError(name) ? form.getError(name) : null}
          onChange={(value) => form.setValue(name, value)}
          onBlur={() => form.setTouched(name)}
          placeholder={FIELD_CONFIG[name].placeholder}
        />
      ))}

      {submitPayment.isError && (
        <p className={styles.formError}>
          Failed to send payment. Check your connection and try again.
        </p>
      )}

      <button type="submit" disabled={submitPayment.isPending}>
        {submitPayment.isPending ? 'Sending...' : 'Pay'}
      </button>
    </form>
  );
}
