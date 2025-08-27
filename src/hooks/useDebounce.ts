import { useRef, useCallback } from 'react';

export function useDebouncedCallback<T extends (...args: unknown[]) => void>(callback: T, delay: number) {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const debouncedFn = useCallback((...args: Parameters<T>) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  return debouncedFn;
}
