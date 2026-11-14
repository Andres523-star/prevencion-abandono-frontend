import type { SugerenciaPreguntaIA } from "../types/iaAssistant";

export const PROMPTS_PREDETERMINADOS: SugerenciaPreguntaIA[] = [
  { id: '1', pregunta: '¿Cuáles estudiantes tienen riesgo crítico de inasistencia en Pasto?', categoria: 'RIESGO' },
  { id: '2', pregunta: '¿Qué materias presentan el mayor índice de reprobación?', categoria: 'MATERIAS' },
  { id: '3', pregunta: 'Resumen de las citas de tutoría programadas para hoy', categoria: 'CITAS' }
];

export const getPromptsForRole = (rol: string): SugerenciaPreguntaIA[] => {
  return PROMPTS_PREDETERMINADOS.filter(p => !p.rolDestino || p.rolDestino === rol);
};
