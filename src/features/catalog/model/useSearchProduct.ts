import { useDeferredValue, useMemo, useState } from 'react';
import { Product } from './types';

export function useSearchProduct(products: Product[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredProducts = useMemo(() => {
    const normalized = deferredSearchTerm.trim().toLowerCase();
    if (!normalized.length) {
      return products;
    }

    return products.filter((p) => p.title.toLowerCase().includes(normalized));
  }, [deferredSearchTerm, products]);

  return { searchTerm, setSearchTerm, filteredProducts };
}
