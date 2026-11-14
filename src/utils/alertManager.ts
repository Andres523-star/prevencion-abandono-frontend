import type { AlertaTemprana, NivelAlerta } from "../types/alerts";

export const filterAlertsByPriority = (
  alerts: AlertaTemprana[],
  nivel?: NivelAlerta
): AlertaTemprana[] => {
  if (!nivel) return alerts;
  return alerts.filter(a => a.nivel === nivel);
};

export const countPendingAlerts = (alerts: AlertaTemprana[]): number => {
  return alerts.filter(a => !a.atendida).length;
};
