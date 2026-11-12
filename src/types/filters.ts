export interface StudentDirectoryFilters {
  searchTerm: string;
  sede: string;
  programa: string;
  semestre: string;
  nivelRiesgo: string;
  factorPrincipal: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
}
