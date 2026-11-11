export interface NavRoute {
  path: string;
  label: string;
  icon?: string;
  rolesPermitidos?: string[];
  badgeCount?: number;
}

export interface RouteBreadcrumb {
  label: string;
  path: string;
}
