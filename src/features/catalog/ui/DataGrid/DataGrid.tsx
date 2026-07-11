import type { ReactNode } from 'react';
import styles from './DataGrid.module.css';

interface DataGridProps<T extends { id: string | number }> {
  data: T[];
  columns: DataGridColumn<T>[];
}

export interface DataGridColumn<T> {
  key: Extract<keyof T, string>;
  header: string;
  width?: string;
  render?: (row: T) => ReactNode;
}

export function DataGrid<T extends { id: string | number }>({ data, columns }: DataGridProps<T>) {
  const gridTemplateColumns = columns.map((column) => column.width ?? '1fr').join(' ');

  return (
    <div className={styles.grid}>
      <div className={styles.header} style={{ gridTemplateColumns }}>
        {columns.map((col) => (
          <div key={col.key} className={styles.headerCell}>
            {col.header}
          </div>
        ))}
      </div>
      <div className={styles.scrollContainer}>
        {data.map((row) => (
          <div key={row.id} className={styles.row} style={{ gridTemplateColumns }}>
            {columns.map((col) => (
              <div key={col.key} className={styles.cell}>
                {col.render ? col.render(row) : String(row[col.key])}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
