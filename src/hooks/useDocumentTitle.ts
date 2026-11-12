import { useEffect } from 'react';

export const useDocumentTitle = (title: string): void => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${title} · Permanencia UCC`;
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
};
