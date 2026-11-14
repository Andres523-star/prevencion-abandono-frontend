import { IndicadorClavePermanencia } from '../types/metrics';

export const evaluateKpiStatus = (actual: number, meta: number): IndicadorClavePermanencia['estadoMeta'] => {
  if (actual >= meta) return 'CUMPLIDA';
  if (actual >= meta * 0.85) return 'EN_RIESGO';
  return 'CRITICA';
};
