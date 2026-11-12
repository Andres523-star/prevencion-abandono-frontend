/**
 * Escalas de color para representacion de riesgos
 */
export const getRiskHexColor = (score: number): string => {
  if (score >= 70) return '#ef4444'; // Rojo (Riesgo Alto)
  if (score >= 30) return '#f59e0b'; // Amarillo (Riesgo Medio)
  return '#10b981';                   // Verde (Riesgo Bajo)
};

export const getRiskLabel = (score: number): string => {
  if (score >= 70) return 'Alto';
  if (score >= 30) return 'Medio';
  return 'Bajo';
};
