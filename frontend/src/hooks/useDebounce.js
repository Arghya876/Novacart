import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing fast-changing values (e.g. search input).
 * @param {any} value - The input value to debounce.
 * @param {number} delay - Delay in milliseconds (default 300ms).
 * @returns {any} Debounced value.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
