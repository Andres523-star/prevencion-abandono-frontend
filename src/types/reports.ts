export interface ResumenRiesgoSede {
  sede: string;
  totalEstudiantes: number;
  riesgoAltoCount: number;
  riesgoMedioCount: number;
  riesgoBajoCount: number;
  tasaPermanencia: number;
}

export interface ReporteConsolidadoNacional {
  fechaCorte: string;
  sedes: ResumenRiesgoSede[];
  totalNacional: number;
}
