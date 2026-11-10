/**
 * Utilidades de exportacion tabular
 */
export const downloadCSV = (filename: string, content: string): void => {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const escapeCSVField = (field: unknown): string => {
  if (field === null || field === undefined) return '""';
  const stringValue = String(field).replace(/"/g, '""');
  return `"${stringValue}"`;
};
