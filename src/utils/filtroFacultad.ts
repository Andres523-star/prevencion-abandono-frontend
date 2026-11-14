export const agruparPorFacultad = <T extends { facultad: string }>(
  items: T[]
): Record<string, T[]> => {
  return items.reduce((acc, item) => {
    const fac = item.facultad || 'Otras';
    if (!acc[fac]) acc[fac] = [];
    acc[fac].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};
