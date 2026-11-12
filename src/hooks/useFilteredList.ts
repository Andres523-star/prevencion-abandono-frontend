import { useMemo } from 'react';

export const useFilteredList = <T>(
  items: T[],
  searchTerm: string,
  filterProps: (keyof T)[]
): T[] => {
  return useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase().trim();
    return items.filter(item =>
      filterProps.some(prop => {
        const val = item[prop];
        return val ? String(val).toLowerCase().includes(term) : false;
      })
    );
  }, [items, searchTerm, filterProps]);
};
