import type { ChangeEvent } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      type="search"
      className={styles.input}
      placeholder="Search by name..."
      value={value}
      onChange={handleChange}
      aria-label="Search for products"
    />
  );
}
