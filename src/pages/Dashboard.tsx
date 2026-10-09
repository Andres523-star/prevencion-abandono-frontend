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

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const data = await estudianteService.listar();
      setEstudiantes(data);
    } catch (e) { setError('Error al cargar estudiantes'); }
    finally { setCargando(false); }
  };

  const getBadge = (riesgo: string) => {
    const r = (riesgo || '').toUpperCase();
    if (r === 'ALTO') return 'badge badge-alto';
    if (r === 'MEDIO') return 'badge badge-medio';
    return 'badge badge-bajo';
  };

  if (cargando) return <div className="container"><p>Cargando...</p></div>;
  if (error) return <div className="container"><p style={{ color: 'red' }}>{error}</p></div>;

  return (
    <div className="container">
      <h1>Dashboard de Estudiantes</h1>

      <div className="top-bar">
        <button onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cerrar formulario' : '+ Nuevo Estudiante'}
        </button>
      </div>

      {mostrarForm && (
        <FormularioEstudiante onCreado={() => { cargar(); setMostrarForm(false); }} />
      )}

      {estudiantes.length === 0 ? (
        <div className="empty">Aún no hay estudiantes registrados. Crea el primero con el botón de arriba.</div>
      ) : (
        <div className="table-wrapper">
          <table>
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
                  <td><span className={getBadge(e.riesgoActual)}>{e.riesgoActual}</span></td>
                  <td><Link to={`/estudiante/${e.id}`}>Ver detalle →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}