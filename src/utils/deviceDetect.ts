/**
 * Deteccion basica de dispositivo para ajustes responsivos
 */
export const isMobileViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};
