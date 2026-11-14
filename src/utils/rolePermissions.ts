import type { RolUsuario, PermisosRol } from "../types/userRoles";

export const MATRIZ_PERMISOS: Record<RolUsuario, PermisosRol> = {
  ESTUDIANTE: { puedeVerNacional: false, puedeVerFacultadCompleta: false, puedeEditarEstudiantes: false, puedeExportarReportes: false, puedeAgendarCitas: true },
  PROFESOR: { puedeVerNacional: false, puedeVerFacultadCompleta: false, puedeEditarEstudiantes: false, puedeExportarReportes: false, puedeAgendarCitas: true },
  JEFE_PROGRAMA: { puedeVerNacional: false, puedeVerFacultadCompleta: false, puedeEditarEstudiantes: true, puedeExportarReportes: true, puedeAgendarCitas: true },
  COORDINADOR_SEDE: { puedeVerNacional: false, puedeVerFacultadCompleta: false, puedeEditarEstudiantes: true, puedeExportarReportes: true, puedeAgendarCitas: true },
  DECANO: { puedeVerNacional: false, puedeVerFacultadCompleta: true, puedeEditarEstudiantes: true, puedeExportarReportes: true, puedeAgendarCitas: true },
  RECTOR: { puedeVerNacional: true, puedeVerFacultadCompleta: true, puedeEditarEstudiantes: true, puedeExportarReportes: true, puedeAgendarCitas: true }
};

export const hasPermission = (rol: RolUsuario, accion: keyof PermisosRol): boolean => {
  return MATRIZ_PERMISOS[rol]?.[accion] ?? false;
};
