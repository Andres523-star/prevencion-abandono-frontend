import { DimensionRiesgo } from '../types/risk';

export const calculateWeightedRisk = (
  academico: number,
  socioeconomico: number,
  asistencia: number,
  institucional: number
): number => {
  const score = (academico * 0.4) + (asistencia * 0.3) + (socioeconomico * 0.2) + (institucional * 0.1);
  return Math.min(100, Math.max(0, Math.round(score)));
};

export const getPrimaryRiskDimension = (scores: Record<DimensionRiesgo, number>): DimensionRiesgo => {
  let maxDim: DimensionRiesgo = 'ACADEMICO';
  let maxScore = -1;
  (Object.keys(scores) as DimensionRiesgo[]).forEach((dim) => {
    if (scores[dim] > maxScore) {
      maxScore = scores[dim];
      maxDim = dim;
    }
  });
  return maxDim;
};
