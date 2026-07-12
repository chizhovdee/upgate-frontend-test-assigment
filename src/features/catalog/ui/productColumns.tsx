import type { DataGridColumn } from '../ui/DataGrid/DataGrid';
import type { Product } from '../model/types';

interface ProductColumnsOption {
  selectedIds: Set<number>;
  toggleSelected: (id: number) => void;
}

export function buildProductColumns({
  selectedIds,
  toggleSelected,
}: ProductColumnsOption): DataGridColumn<Product>[] {
  return [
    {
      key: 'id',
      header: '',
      width: '40px',
      render: (product) => (
        <input
          type="checkbox"
          aria-label={`Select ${product.title}`}
          checked={selectedIds.has(product.id)}
          onChange={() => toggleSelected(product.id)}
        />
      ),
    },
    {
      key: 'image',
      header: '',
      width: '56px',
      render: (product) => <img src={product.image} alt="" width={36} height={36} />,
    },
    { key: 'title', header: 'Title', truncate: true },
    { key: 'category', header: 'Category', width: '160px' },
    {
      key: 'price',
      header: 'Price',
      width: '96px',
      render: (product) => `$${product.price.toFixed(2)}`,
    },
    {
      key: 'rating',
      header: 'Rating',
      width: '96px',
      render: (product) => `${product.rating.rate} (${product.rating.count})`,
    },
  ];
}
