import { ResumenRiesgoSede } from '../types/reports';

export const calculateNationalRetentionRate = (sedes: ResumenRiesgoSede[]): number => {
  if (sedes.length === 0) return 0;
  const totalStudents = sedes.reduce((acc, s) => acc + s.totalEstudiantes, 0);
  const totalSafe = sedes.reduce((acc, s) => acc + s.riesgoBajoCount, 0);
  return totalStudents > 0 ? parseFloat(((totalSafe / totalStudents) * 100).toFixed(1)) : 0;
};
