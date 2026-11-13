export interface SugerenciaPreguntaIA {
  id: string;
  pregunta: string;
  categoria: 'RIESGO' | 'MATERIAS' | 'CITAS' | 'GENERAL';
  rolDestino?: string;
}

export interface RespuestaAsistenteIA {
  mensaje: string;
  estudiantesRelacionados?: string[];
  nivelConfianza: number;
}
