import { useMemo } from 'react';
import { useProducts } from '../api/useProducts';
import styles from './CatalogPage.module.css';
import { DataGrid } from './DataGrid';
import { buildProductColumns } from './productColumns';
import { SearchBar } from './SearchBar';
import { useSearchProduct } from '../model/useSearchProduct';
import { CartPanel } from './CartPanel/CartPanel';
import { useSelectProduct } from '../model/useSelectProduct';
import { useCart } from '../model/useCart';

export function CatalogPage() {
  const productsQuery = useProducts();
  const products = productsQuery.data ?? [];

  const { searchTerm, setSearchTerm, filteredProducts } = useSearchProduct(products);
  const { selectedIds, toggleSelected, clearSelected } = useSelectProduct();

  const productColumns = useMemo(
    () => buildProductColumns({ selectedIds, toggleSelected }),
    [selectedIds, toggleSelected],
  );

  const cart = useCart();

  const addSelectedToCart = () => {
    cart.addMany(Array.from(selectedIds));
    clearSelected();
  };

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

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <button type="button" disabled={selectedIds.size === 0} onClick={addSelectedToCart}>
          Add to Cart ({selectedIds.size})
        </button>
        <CartPanel />
      </div>
      <div className={styles.gridContainer}>
        <DataGrid data={filteredProducts} columns={productColumns} />
      </div>
    </div>
  );
}
