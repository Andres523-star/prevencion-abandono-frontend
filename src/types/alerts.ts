export type NivelAlerta = 'INFORMATIVA' | 'MODERADA' | 'CRITICA';

export interface AlertaTemprana {
  id: string;
  estudianteId: string;
  nombreEstudiante: string;
  sede: string;
  programa: string;
  motivo: string;
  nivel: NivelAlerta;
  creadaEn: string;
  atendida: boolean;
}
