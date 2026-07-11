import { usePaymentPolling } from '../api/usePaymentPolling';
import styles from './LoaderPage.module.css';

export function LoaderPage() {
  const { status, retry } = usePaymentPolling();

  if (status === 'error') {
    return (
      <div className={styles.page}>
        <p className={styles.message}>Не удалось получить статус оплаты.</p>
        <button type="button" onClick={retry}>
          Повторить
        </button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={styles.page}>
        <p className={styles.message}>Покупка была успешной</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <p className={styles.message}>Ожидание подтверждения оплаты...</p>
    </div>
  );
}
