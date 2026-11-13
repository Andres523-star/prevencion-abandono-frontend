export interface MockEstudianteItem {
  id: number;
  nombre: string;
  sede: string;
  programa: string;
  riesgo: number;
  promedio: number;
}

export const ESTUDIANTES_MOCK_DATA: MockEstudianteItem[] = [
  { id: 101, nombre: 'Camila Rodriguez', sede: 'Pasto', programa: 'Ingeniería de Sistemas', riesgo: 85, promedio: 2.7 },
  { id: 102, nombre: 'Daniel Morales', sede: 'Bogotá', programa: 'Medicina', riesgo: 42, promedio: 3.8 },
  { id: 103, nombre: 'Valentina Restrepo', sede: 'Medellín', programa: 'Derecho', riesgo: 18, promedio: 4.4 },
  { id: 104, nombre: 'Mateo Caicedo', sede: 'Cali', programa: 'Psicología', riesgo: 72, promedio: 2.9 },
  { id: 105, nombre: 'Sofia Gomez', sede: 'Bucaramanga', programa: 'Contaduría Pública', riesgo: 25, promedio: 4.1 }
];
