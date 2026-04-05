// ─── useLocalStorage ──────────────────────────────────────────────────────────
// Generic hook for persisting state in localStorage with JSON serialisation.
import { useState, useCallback, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Sync across tabs via the "storage" event
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try { setStoredValue(JSON.parse(e.newValue) as T); } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue(prev => {
        const next = typeof value === 'function'
          ? (value as (prev: T) => T)(prev)
          : value;
        try { window.localStorage.setItem(key, JSON.stringify(next)); } catch { /* quota exceeded */ }
        return next;
      });
    },
    [key],
  );

  const removeValue = useCallback(() => {
    window.localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}
