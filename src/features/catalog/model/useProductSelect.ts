import { useCallback, useState } from 'react';

export function useProductSelect() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleSelected = useCallback(
    (id: number) => {
      setSelectedIds((state) => {
        const newState = new Set(state);

        if (newState.has(id)) {
          newState.delete(id);
        } else {
          newState.add(id);
        }

        return newState;
      });
    },
    [setSelectedIds],
  );

  const clearSelected = useCallback(() => setSelectedIds(new Set()), [setSelectedIds]);

  return { selectedIds, toggleSelected, clearSelected };
}
