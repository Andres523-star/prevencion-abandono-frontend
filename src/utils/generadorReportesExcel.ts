export const generarContenidoCSV = (
  encabezados: string[],
  filas: (string | number)[][]
): string => {
  const lineas = [encabezados.join(',')];
  filas.forEach(fila => {
    lineas.push(fila.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
  });
  return lineas.join('\r\n');
};
