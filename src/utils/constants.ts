/**
 * Constantes institucionales de la Universidad Cooperativa de Colombia (UCC)
 */
export const SEDES_UCC = [
  'Apartadó', 'Arauca', 'Barrancabermeja', 'Bogotá', 'Bucaramanga',
  'Cali', 'Cartago', 'Espinal', 'Ibagué', 'Medellín', 'Montería',
  'Neiva', 'Pasto', 'Pereira', 'Popayán', 'Quibdó', 'Santa Marta', 'Villavicencio'
] as const;

export type SedeUCC = typeof SEDES_UCC[number];

export const FACULTADES = [
  'Ingeniería', 'Ciencias de la Salud', 'Ciencias Económicas y Administrativas',
  'Derecho', 'Educación', 'Ciencias Sociales y Humanas'
] as const;

export const NIVELES_RIESGO = {
  BAJO: { label: 'Bajo', min: 0, max: 29, color: '#10b981' },
  MEDIO: { label: 'Medio', min: 30, max: 69, color: '#f59e0b' },
  ALTO: { label: 'Alto', min: 70, max: 100, color: '#ef4444' }
} as const;
