export type ColorSemaforo = 'verde' | 'amarillo' | 'rojo';

export const determinarColorSemaforo = (scoreRiesgo: number): ColorSemaforo => {
  if (scoreRiesgo >= 70) return 'rojo';
  if (scoreRiesgo >= 30) return 'amarillo';
  return 'verde';
};
