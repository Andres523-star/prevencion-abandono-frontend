import type { BalanceInasistencias } from "../types/attendance";

export const calculateAttendanceBalance = (
  totalClases: number,
  faltasTotales: number,
  maxPorcentaje = 20
): BalanceInasistencias => {
  const porcentaje = totalClases > 0 ? parseFloat(((faltasTotales / totalClases) * 100).toFixed(1)) : 0;
  return {
    totalClases,
    faltasTotales,
    porcentajeFaltas: porcentaje,
    alertaFalla: porcentaje >= maxPorcentaje
  };
};
