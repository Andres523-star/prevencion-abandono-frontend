export type DimensionRiesgo = 'ACADEMICO' | 'SOCIOECONOMICO' | 'ASISTENCIA' | 'INSTITUCIONAL';

export interface FactorRiesgoDetalle {
  dimension: DimensionRiesgo;
  peso: number;
  descripcion: string;
  impacto: 'BAJO' | 'MEDIO' | 'ALTO';
}

export interface EvaluacionRiesgoEstudiante {
  estudianteId: string;
  scoreGlobal: number;
  nivel: 'BAJO' | 'MEDIO' | 'ALTO';
  factoresCriticos: FactorRiesgoDetalle[];
  tendenciaSemestre: 'MEJORA' | 'ESTABLE' | 'DETERIORO';
}
