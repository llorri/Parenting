import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch (error) {
      console.warn('Unable to read from localStorage', error);
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((previous) => {
        const valueToStore = value instanceof Function ? value(previous) : value;

        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (error) {
            console.warn('Unable to write to localStorage', error);
          }
        }

        return valueToStore;
      });
    },
    [key]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (window.localStorage.getItem(key) === null) {
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
      }
    } catch (error) {
      console.warn('Unable to initialize localStorage', error);
    }
  }, [defaultValue, key]);

  return [storedValue, setValue] as const;
}
