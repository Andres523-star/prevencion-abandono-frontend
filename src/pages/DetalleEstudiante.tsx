import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { estudianteService, analisisService } from '../services/api';
import type { Estudiante, AnalisisResponse } from '../types';

export default function DetalleEstudiante() {
  const { id } = useParams<{ id: string }>();
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [analisis, setAnalisis] = useState<AnalisisResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [analizando, setAnalizando] = useState(false);

  useEffect(() => {
    cargar();
  }, [id]);

  const cargar = async () => {
    try {
      const data = await estudianteService.obtener(Number(id));
      setEstudiante(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const ejecutarAnalisis = async () => {
    setAnalizando(true);
    try {
      const data = await analisisService.analizar(Number(id));
      setAnalisis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalizando(false);
    }
  };

  if (cargando) return <p>Cargando...</p>;
  if (!estudiante) return <p>Estudiante no encontrado</p>;

  return (
    <div style={{ padding: 20 }}>
      <Link to="/">← Volver al Dashboard</Link>
      <h1>Detalle del Estudiante</h1>

      <div style={{ marginTop: 20 }}>
        <p><strong>ID:</strong> {estudiante.id}</p>
        <p><strong>Nombre:</strong> {estudiante.nombre}</p>
        <p><strong>Carrera:</strong> {estudiante.carrera}</p>
        <p><strong>Semestre:</strong> {estudiante.semestre}</p>
        <p><strong>Email:</strong> {estudiante.email}</p>
        <p><strong>Riesgo actual:</strong> {estudiante.riesgoActual}</p>
      </div>

      <button onClick={ejecutarAnalisis} disabled={analizando} style={{ marginTop: 20, padding: 10 }}>
        {analizando ? 'Analizando...' : 'Analizar con IA'}
      </button>

      {analisis && (
        <div style={{ marginTop: 20, padding: 15, background: '#f0f0f0', borderRadius: 8 }}>
          <h3>Recomendación de la IA</h3>
          <p><strong>Riesgo:</strong> {analisis.riesgoActual}</p>
          <p><strong>Recomendación:</strong> {analisis.recomendacion}</p>
          <p><strong>Fecha:</strong> {analisis.fecha}</p>
        </div>
      )}
    </div>
  );
}