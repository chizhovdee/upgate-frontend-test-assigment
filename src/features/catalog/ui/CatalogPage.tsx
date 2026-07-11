import { useProducts } from '../api/useProducts';

export function CatalogPage() {
  const productsQuery = useProducts();
  const products = productsQuery.data ?? [];
  return <>{products.map((p) => p.id).join(', ') }</>;
}
