import { MateriaAcademica } from '../types/academic';

export const calculateWeightedAverage = (materias: MateriaAcademica[]): number => {
  let totalPuntos = 0;
  let totalCreditos = 0;

  materias.forEach(m => {
    if (m.notaFinal !== undefined) {
      totalPuntos += m.notaFinal * m.creditos;
      totalCreditos += m.creditos;
    }
  });

  return totalCreditos > 0 ? parseFloat((totalPuntos / totalCreditos).toFixed(2)) : 0.0;
};

export const hasAttendanceRisk = (materia: MateriaAcademica): boolean => {
  return materia.faltas >= materia.maxFaltasPermitidas * 0.75;
};
