export type MotivoFalta = 'SALUD' | 'LABORAL' | 'CALAMIDAD_DOMESTICA' | 'OTRO';

export interface JustificacionInasistencia {
  id: string;
  estudianteId: string;
  materiaCodigo: string;
  fechaFalta: string;
  motivo: MotivoFalta;
  descripcion: string;
  soporteUrl?: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
}
