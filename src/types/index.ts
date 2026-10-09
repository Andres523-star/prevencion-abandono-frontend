export interface Estudiante {
  id: number;
  nombre: string;
  carrera: string;
  semestre: number;
  email: string;
  riesgoActual: string;
  causas?: any[];
  intervenciones?: any[];
}

export interface AnalisisResponse {
  estudianteId: number;
  nombre: string;
  riesgoActual: string;
  recomendacion: string;
  fecha: string;
}

export interface Reporte {
  totalEstudiantes: number;
  riesgoAlto: number;
  riesgoMedio: number;
  riesgoBajo: number;
}