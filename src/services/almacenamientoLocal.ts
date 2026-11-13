export const guardarPreferencia = (clave: string, valor: string): void => {
  try {
    localStorage.setItem(`ucc_pref_${clave}`, valor);
  } catch {
    // Modo privado o cuota excedida
  }
};

export const obtenerPreferencia = (clave: string, defecto = ''): string => {
  try {
    return localStorage.getItem(`ucc_pref_${clave}`) || defecto;
  } catch {
    return defecto;
  }
};
