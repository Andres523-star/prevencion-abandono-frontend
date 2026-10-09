import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { estudianteService } from '../services/api';
import FormularioEstudiante from '../components/FormularioEstudiante';
import type { Estudiante } from '../types';

export default function Dashboard() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const data = await estudianteService.listar();
      setEstudiantes(data);
    } catch (e) {
      setError('Error al cargar estudiantes');
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard - Estudiantes</h1>

      <div style={{ display: 'flex', gap: 15 }}>
        <Link to="/reportes">Ver Reportes</Link>
        <button onClick={() => setMostrarForm(!mostrarForm)} style={{ padding: '4px 10px' }}>
          {mostrarForm ? 'Ocultar formulario' : '+ Nuevo Estudiante'}
        </button>
      </div>

      {mostrarForm && (
        <FormularioEstudiante onCreado={() => { cargar(); setMostrarForm(false); }} />
      )}

      {estudiantes.length === 0 ? (
        <p style={{ marginTop: 20 }}>No hay estudiantes registrados.</p>
      ) : (
        <table border={1} cellPadding={8} style={{ marginTop: 20, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Carrera</th>
              <th>Semestre</th>
              <th>Riesgo</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((e) => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.nombre}</td>
                <td>{e.carrera}</td>
                <td>{e.semestre}</td>
                <td>{e.riesgoActual}</td>
                <td>
                  <Link to={`/estudiante/${e.id}`}>Ver detalle</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}