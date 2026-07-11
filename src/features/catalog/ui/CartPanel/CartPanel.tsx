import { useNavigate } from 'react-router-dom';
import { useCart } from 'features/catalog/model/useCart';
import styles from './CartPanel.module.css';

export function CartPanel() {
  const cart = useCart();
  const navigate = useNavigate();
  const isCartEmpty = cart.ids.length === 0;

  return (
    <div className={styles.panel}>
      <span className={styles.count}>In cart: {cart.ids.length}</span>
      <button type="button" disabled={isCartEmpty} onClick={() => navigate('/checkout')}>
        Checkout
      </button>
      <button type="button" disabled={isCartEmpty} onClick={cart.clear}>
        Clear
      </button>
    </div>
  );
}
