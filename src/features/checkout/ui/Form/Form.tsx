import { FormField } from 'shared/ui/FormField';

import styles from './Form.module.css';
import { FIELD_NAMES, FIELD_CONFIG } from 'features/checkout/model/constants';
import { useForm } from 'features/checkout/model/useForm';

export function Form() {
  const form = useForm();

  const handleSubmit = () => {};

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {FIELD_NAMES.map((name) => (
        <FormField
          key={name}
          label={FIELD_CONFIG[name].label}
          name={name}
          value={form.getValue(name)}
          error={form.shouldShowError(name) ? form.getError(name) : null}
          onChange={(value) => form.setValue(name, value)}
          onBlur={() => form.setTouched(name)}
          placeholder={FIELD_CONFIG[name].placeholder}
        />
      ))}
    </form>
  );
}
