export interface StorageSlot<T> {
  get: () => T;
  set: (value: T) => void;
  subscribe: (listener: Listener) => () => void;
}

interface Listener {
  (): void;
}

export function createStorageSlot<T>(key: string, initialValue: T): StorageSlot<T> {
  let cachedValue = readFromStorage<T>(key, initialValue);

  const listeners = new Set<Listener>();
  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  window.addEventListener('storage', (event) => {
    if (event.key !== key) {
      return;
    }

    cachedValue = readFromStorage(key, initialValue);
    notify();
  });

  return {
    get: () => cachedValue,
    set: (value) => {
      cachedValue = value;
      saveToStorage(key, value);
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function readFromStorage<T>(key: string, initialValue: T) {
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return initialValue;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return initialValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`shared/lib/cache: failed to persist "${key}" to localStorage`, error);
  }
}
