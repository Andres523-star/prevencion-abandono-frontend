export type RolUsuario = 'ESTUDIANTE' | 'PROFESOR' | 'JEFE_PROGRAMA' | 'COORDINADOR_SEDE' | 'DECANO' | 'RECTOR';

export interface PermisosRol {
  puedeVerNacional: boolean;
  puedeVerFacultadCompleta: boolean;
  puedeEditarEstudiantes: boolean;
  puedeExportarReportes: boolean;
  puedeAgendarCitas: boolean;
}
