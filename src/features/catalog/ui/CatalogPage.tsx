import { useProducts } from '../api/useProducts';
import styles from './CatalogPage.module.css';

export function CatalogPage() {
  const productsQuery = useProducts();
  //const products = productsQuery.data ?? [];

  if (productsQuery.isPending) {
    return <div className={styles.status}>Catalog loading...</div>;
  }

  if (productsQuery.isError) {
    return (
      <div className={styles.status}>
        <p>Failed to load the catalog.</p>
        <button type="button" onClick={() => productsQuery.refetch()}>
          Repeat
        </button>
      </div>
    );
  }

  return <div className={styles.page}>CatalogPage</div>;
}
