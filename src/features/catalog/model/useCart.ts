import { useSyncExternalStore } from 'react';
import { createStorageSlot } from 'shared/lib/cache';

interface Cart {
  ids: number[];
  add: (id: number) => void;
  addMany: (ids: number[]) => void;
  remove(id: number): void;
  clear: () => void;
}

const cartSlot = createStorageSlot<number[]>('cart', []);

export function useCart(): Cart {
  const ids = useSyncExternalStore(cartSlot.subscribe, cartSlot.get, () => []);

  return { ids, add, addMany, remove, clear };
}

function add(id: number) {
  const current = cartSlot.get();

  if (!current.includes(id)) {
    cartSlot.set([...current, id]);
  }
}

function addMany(ids: number[]) {
  const current = cartSlot.get();
  const newValues = new Set([...current, ...ids]);

  cartSlot.set(Array.from(newValues));
}

function remove(id: number) {
  const current = cartSlot.get();

  cartSlot.set(current.filter((currentId) => currentId !== id));
}

function clear() {
  cartSlot.set([]);
}
