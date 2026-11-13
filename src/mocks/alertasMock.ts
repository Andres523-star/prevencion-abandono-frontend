export interface MockAlertaItem {
  id: string;
  estudiante: string;
  sede: string;
  causa: string;
  severidad: 'ALTA' | 'MEDIA' | 'BAJA';
}

export const ALERTAS_MOCK_DATA: MockAlertaItem[] = [
  { id: 'ALT-1', estudiante: 'Camila Rodriguez', sede: 'Pasto', causa: 'Inasistencia reiterada (8 faltas)', severidad: 'ALTA' },
  { id: 'ALT-2', estudiante: 'Mateo Caicedo', sede: 'Cali', causa: 'Reprobación de primer corte en Cálculo', severidad: 'ALTA' },
  { id: 'ALT-3', estudiante: 'Daniel Morales', sede: 'Bogotá', causa: 'Solicitud de apoyo socioeconómico', severidad: 'MEDIA' }
];
