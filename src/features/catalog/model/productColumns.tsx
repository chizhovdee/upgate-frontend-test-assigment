import { DataGridColumn } from '../ui/DataGrid/DataGrid';
import { Product } from './types';

export function buildProductColumns(): DataGridColumn<Product>[] {
  return [
    {
      key: 'id',
      header: '',
      width: '40px',
      render: (product) => <input type="checkbox" aria-label={`Выбрать ${product.title}`} />,
    },
    {
      key: 'image',
      header: '',
      width: '56px',
      render: (product) => <img src={product.image} alt="" width={36} height={36} />,
    },
    { key: 'title', header: 'Название' },
    { key: 'category', header: 'Категория', width: '160px' },
    {
      key: 'price',
      header: 'Цена',
      width: '96px',
      render: (product) => `$${product.price.toFixed(2)}`,
    },
    {
      key: 'rating',
      header: 'Рейтинг',
      width: '96px',
      render: (product) => `${product.rating.rate} (${product.rating.count})`,
    },
  ];
}
