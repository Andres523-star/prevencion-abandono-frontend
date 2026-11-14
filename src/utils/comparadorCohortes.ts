export interface ResumenCohorte {
  etiqueta: string;
  totalEstudiantes: number;
  promedioRiesgo: number;
}

export const compararCohortes = (cohorteA: ResumenCohorte, cohorteB: ResumenCohorte): number => {
  return cohorteA.promedioRiesgo - cohorteB.promedioRiesgo;
};
