import { useNavigate } from 'react-router-dom';
import { usePaymentPolling } from '../api/usePaymentPolling';
import styles from './LoaderPage.module.css';

export function LoaderPage() {
  const { status, retry } = usePaymentPolling();
  const navigate = useNavigate();

  if (status === 'error') {
    return (
      <div className={styles.page}>
        <p className={styles.message}>Unable to retrieve payment status.</p>
        <button type="button" onClick={retry}>
          Repeat
        </button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={styles.page}>
        <p className={styles.message}>The purchase was successful</p>
        <button type="button" onClick={() => navigate('/')}>
          Return to catalog
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <p className={styles.message}>Waiting for payment confirmation...</p>
    </div>
  );
}
