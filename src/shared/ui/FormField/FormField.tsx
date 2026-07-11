import clsx from 'clsx';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
  type?: string;
}

export function FormField({
  label,
  name,
  value,
  error,
  onChange,
  onBlur,
  placeholder,
  type,
}: FormFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        type={type}
        className={clsx(styles.input, error && styles.inputError)}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
      />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}
