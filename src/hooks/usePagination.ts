import { useState, useMemo } from 'react';

export interface UsePaginationOptions {
  totalItems: number;
  initialPage?: number;
  pageSize?: number;
}

export const usePagination = ({
  totalItems,
  initialPage = 1,
  pageSize = 10
}: UsePaginationOptions) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / pageSize)), [totalItems, pageSize]);

  const goToNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));

  return {
    currentPage,
    totalPages,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};
