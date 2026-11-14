import { MotivoFalta } from '../types/justifications';

export const MOTIVOS_LABELS: Record<MotivoFalta, string> = {
  SALUD: 'Incapacidad médica',
  LABORAL: 'Compromiso laboral',
  CALAMIDAD_DOMESTICA: 'Calamidad doméstica',
  OTRO: 'Otras razones debidamente justificadas'
};

export const getMotivoLabel = (motivo: MotivoFalta): string => {
  return MOTIVOS_LABELS[motivo] || motivo;
};
