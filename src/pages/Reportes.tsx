import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reporteService } from '../services/api';
import type { Reporte } from '../types';

export default function Reportes() {
  const [reporte, setReporte] = useState<Reporte | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const data = await reporteService.obtener();
      setReporte(data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!reporte) return <p>Cargando...</p>;

  return (
    <div style={{ padding: 20 }}>
      <Link to="/">← Volver al Dashboard</Link>
      <h1>Reportes</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 15, marginTop: 20 }}>
        <div style={{ padding: 20, background: '#e3f2fd', borderRadius: 8 }}>
          <h3>Total</h3>
          <p style={{ fontSize: 32, margin: 0 }}>{reporte.totalEstudiantes}</p>
        </div>
        <div style={{ padding: 20, background: '#ffebee', borderRadius: 8 }}>
          <h3>Riesgo Alto</h3>
          <p style={{ fontSize: 32, margin: 0 }}>{reporte.riesgoAlto}</p>
        </div>
        <div style={{ padding: 20, background: '#fff3e0', borderRadius: 8 }}>
          <h3>Riesgo Medio</h3>
          <p style={{ fontSize: 32, margin: 0 }}>{reporte.riesgoMedio}</p>
        </div>
        <div style={{ padding: 20, background: '#e8f5e9', borderRadius: 8 }}>
          <h3>Riesgo Bajo</h3>
          <p style={{ fontSize: 32, margin: 0 }}>{reporte.riesgoBajo}</p>
        </div>
      </div>
    </div>
  );
}