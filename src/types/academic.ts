export interface MateriaAcademica {
  codigo: string;
  nombre: string;
  creditos: number;
  notaCorte1?: number;
  notaCorte2?: number;
  notaFinal?: number;
  faltas: number;
  maxFaltasPermitidas: number;
}

export interface ResumenAcademicoSemestre {
  periodo: string;
  materias: MateriaAcademica[];
  promedioSemestre: number;
  creditosInscritos: number;
  creditosAprobados: number;
}
