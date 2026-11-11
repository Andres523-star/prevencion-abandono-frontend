/**
 * Utilidades para accesibilidad web (WCAG 2.1)
 */
export const handleKeyboardActivation = (
  e: React.KeyboardEvent,
  callback: () => void
): void => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    callback();
  }
};

export const generateUniqueId = (prefix = 'ucc'): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};
