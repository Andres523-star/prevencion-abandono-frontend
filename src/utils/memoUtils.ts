/**
 * Utilidades de debounce y throttling
 */
export const debounce = <T extends (...args: unknown[]) => void>(func: T, waitMs: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitMs);
  };
};
