import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField } from 'shared/ui/FormField';
import styles from './Form.module.css';
import { FIELD_NAMES, FIELD_CONFIG } from 'features/checkout/model/constants';
import { useForm } from 'features/checkout/model/useForm';
import { useSubmitPayment } from 'features/checkout/api/useSubmitPayment';
import { useCart } from 'features/catalog/model/useCart';
import { normalizeCardNumber } from 'shared/lib/validators';
import { useBeforeunload } from 'shared/hooks/useBeforeunload';

export function Form() {
  const navigate = useNavigate();
  const form = useForm();
  const cart = useCart();
  const submitPayment = useSubmitPayment();

  const [submitSucceeded, setSubmitSucceeded] = useState(false);

  useBeforeunload(form.isDirty && !submitSucceeded);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.checkSubmit();

    if (!form.isValid || cart.isEmpty) {
      return;
    }

    submitPayment.mutate(
      {
        cardNumber: normalizeCardNumber(form.getValue('cardNumber')),
        email: form.getValue('email'),
        cvv: form.getValue('cvv'),
        expire: form.getValue('expire'),
        productIds: cart.ids,
      },
      {
        onSuccess: () => {
          setSubmitSucceeded(true);
          cart.clear();
          navigate('/loader', { replace: true });
        },
      },
    );
  };

  if (cart.isEmpty) {
    return (
      <div className={styles.form}>
        <p className={styles.formError}>Cart is empty!</p>
      </div>
    );
  }

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
