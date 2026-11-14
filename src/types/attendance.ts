export interface RegistroAsistenciaClase {
  claseId: string;
  fecha: string;
  asistio: boolean;
  justificada: boolean;
}

export interface BalanceInasistencias {
  totalClases: number;
  faltasTotales: number;
  porcentajeFaltas: number;
  alertaFalla: boolean;
}
