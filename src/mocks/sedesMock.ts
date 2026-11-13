export interface MockSedeDetalle {
  codigo: string;
  nombre: string;
  departamento: string;
  rectoria: string;
}

export const SEDES_MOCK_LISTA: MockSedeDetalle[] = [
  { codigo: 'PAS', nombre: 'Pasto', departamento: 'Nariño', rectoria: 'Sur' },
  { codigo: 'BOG', nombre: 'Bogotá', departamento: 'Cundinamarca', rectoria: 'Centro' },
  { codigo: 'MED', nombre: 'Medellín', departamento: 'Antioquia', rectoria: 'Noroccidente' },
  { codigo: 'CAL', nombre: 'Cali', departamento: 'Valle del Cauca', rectoria: 'Suroccidente' },
  { codigo: 'BUC', nombre: 'Bucaramanga', departamento: 'Santander', rectoria: 'Oriente' }
];
