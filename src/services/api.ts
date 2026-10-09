import axios from 'axios';
import type { Estudiante, AnalisisResponse, Reporte } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const estudianteService = {
  listar: async (): Promise<Estudiante[]> => {
    const { data } = await api.get('/estudiantes');
    return data;
  },
  obtener: async (id: number): Promise<Estudiante> => {
    const { data } = await api.get(`/estudiantes/${id}`);
    return data;
  },
  crear: async (estudiante: Partial<Estudiante>): Promise<Estudiante> => {
    const { data } = await api.post('/estudiantes', estudiante);
    return data;
  },
};

export const analisisService = {
  analizar: async (id: number): Promise<AnalisisResponse> => {
    const { data } = await api.post(`/analizar/${id}`);
    return data;
  },
};

export const reporteService = {
  obtener: async (): Promise<Reporte> => {
    const { data } = await api.get('/reportes');
    return data;
  },
};