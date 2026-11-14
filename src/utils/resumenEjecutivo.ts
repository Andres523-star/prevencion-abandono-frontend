export const generarTextoResumenSede = (
  nombreSede: string,
  totalEstudiantes: number,
  tasaRetencion: number
): string => {
  return `La sede ${nombreSede} registra ${totalEstudiantes} estudiantes activos con una tasa de retención estimada del ${tasaRetencion}%.`;
};
