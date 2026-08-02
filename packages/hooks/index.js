/**
 * Shared custom hook helpers.
 */
export function useLocalStorage(key, initialValue) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : initialValue;
}
