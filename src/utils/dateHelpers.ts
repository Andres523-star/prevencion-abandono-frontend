/**
 * Utilidades para manejo y formateo de fechas
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'hace un momento';
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
  const days = Math.floor(diffInSeconds / 86400);
  return days === 1 ? 'ayer' : `hace ${days} días`;
};

export const formatFullSpanishDate = (date: Date): string => {
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getCurrentAcademicPeriod = (): string => {
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  return `${year}-${month < 6 ? '1' : '2'}`;
};
