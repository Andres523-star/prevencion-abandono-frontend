import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export const useSortedData = <T>(
  data: T[],
  defaultKey: keyof T,
  defaultDirection: SortDirection = 'asc'
) => {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [direction, setDirection] = useState<SortDirection>(defaultDirection);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, direction]);

  const requestSort = (key: keyof T) => {
    if (sortKey === key) {
      setDirection(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setDirection('asc');
    }
  };

  return { sortedData, sortKey, direction, requestSort };
};
