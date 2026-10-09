import { useState } from 'react';
import { estudianteService } from '../services/api';

interface Props {
  onCreado: () => void;
}

export default function FormularioEstudiante({ onCreado }: Props) {
  const [nombre, setNombre] = useState('');
  const [carrera, setCarrera] = useState('');
  const [semestre, setSemestre] = useState(1);
  const [email, setEmail] = useState('');
  const [riesgo, setRiesgo] = useState('BAJO');
  const [mensaje, setMensaje] = useState('');

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await estudianteService.crear({
        nombre,
        carrera,
        semestre,
        email,
        riesgoActual: riesgo,
      });
      setMensaje('Estudiante creado correctamente');
      setNombre('');
      setCarrera('');
      setSemestre(1);
      setEmail('');
      setRiesgo('BAJO');
      onCreado();
    } catch (err) {
      setMensaje('Error al crear estudiante');
    }
  };

  return (
    <form onSubmit={enviar} style={{ marginTop: 20, padding: 20, background: '#fff', borderRadius: 8, maxWidth: 500 }}>
      <h3>Nuevo Estudiante</h3>

      <div style={{ marginBottom: 10 }}>
        <label>Nombre: </label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ width: '100%', padding: 6 }} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Carrera: </label>
        <input value={carrera} onChange={(e) => setCarrera(e.target.value)} required style={{ width: '100%', padding: 6 }} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Semestre: </label>
        <input type="number" min={1} max={12} value={semestre} onChange={(e) => setSemestre(Number(e.target.value))} required style={{ width: '100%', padding: 6 }} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Email: </label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 6 }} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Riesgo: </label>
        <select value={riesgo} onChange={(e) => setRiesgo(e.target.value)} style={{ width: '100%', padding: 6 }}>
          <option value="BAJO">BAJO</option>
          <option value="MEDIO">MEDIO</option>
          <option value="ALTO">ALTO</option>
        </select>
      </div>

      <button type="submit" style={{ padding: 10, width: '100%' }}>
        Crear Estudiante
      </button>

      {mensaje && <p style={{ marginTop: 10 }}>{mensaje}</p>}
    </form>
  );
}