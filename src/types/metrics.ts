export interface IndicadorClavePermanencia {
  codigo: string;
  nombre: string;
  valorActual: number;
  metaInstitucional: number;
  unidad: '%' | 'ESTUDIANTES';
  estadoMeta: 'CUMPLIDA' | 'EN_RIESGO' | 'CRITICA';
}
