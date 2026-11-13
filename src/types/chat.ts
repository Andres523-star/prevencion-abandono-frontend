export type RemitenteTipo = 'ESTUDIANTE' | 'PROFESOR' | 'TUTOR' | 'SISTEMA_IA';

export interface MensajeChat {
  id: string;
  remitente: RemitenteTipo;
  texto: string;
  timestamp: string;
  leido: boolean;
  adjuntos?: {
    nombre: string;
    tipo: 'PDF' | 'AUDIO' | 'DOC';
    url: string;
  }[];
}
