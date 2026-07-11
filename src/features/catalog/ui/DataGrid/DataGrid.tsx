import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';

import styles from './DataGrid.module.css';

export interface DataGridColumn<T> {
  key: Extract<keyof T, string>;
  header: string;
  truncate?: boolean;
  width?: string;
  render?: (row: T) => ReactNode;
}

export interface DataGridProps<T extends { id: string | number }> {
  data: T[];
  columns: DataGridColumn<T>[];
}

const ROW_HEIGHT = 56;

export function DataGrid<T extends { id: string | number }>({ data, columns }: DataGridProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const gridTemplateColumns = columns.map((column) => column.width ?? '1fr').join(' ');

  return (
    <div className={styles.grid}>
      <div className={styles.header} style={{ gridTemplateColumns }}>
        {columns.map((column) => (
          <div key={column.key} className={styles.headerCell}>
            {column.header}
          </div>
        ))}
      </div>
      <div ref={scrollRef} className={styles.scrollContainer}>
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = data[virtualRow.index];
            return (
              <div
                key={row.id}
                className={styles.row}
                style={{
                  gridTemplateColumns,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={clsx(styles.cell, { [styles.cellTruncate]: column.truncate })}
                  >
                    {column.render ? column.render(row) : String(row[column.key])}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
