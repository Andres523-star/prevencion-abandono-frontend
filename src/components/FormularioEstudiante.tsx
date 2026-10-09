import { useState } from 'react';
import { estudianteService } from '../services/api';

interface Props {
  onCreado: () => void;
}

export default function FormularioEstudiante({ onCreado }: Props) {
  const [nombre, setNombre] = useState('');
  const [carrera, setCarrera] = useState('');
  const [semestre, setSemestre] = useState('');
  const [email, setEmail] = useState('');
  const [riesgo, setRiesgo] = useState('BAJO');
  const [mensaje, setMensaje] = useState('');

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await estudianteService.crear({
        nombre,
        carrera,
        semestre: Number(semestre),
        email,
        riesgoActual: riesgo,
      });
      setMensaje('Estudiante creado correctamente');
      setNombre('');
      setCarrera('');
      setSemestre('');
      setEmail('');
      setRiesgo('BAJO');
      onCreado();
    } catch (err) {
      setMensaje('Error al crear estudiante');
    }
  };

  return (
    <form onSubmit={enviar} className="form-card">
      <h3>Nuevo Estudiante</h3>

      <label>Nombre</label>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Ej: Juan Pérez" />

      <label>Carrera</label>
      <input value={carrera} onChange={(e) => setCarrera(e.target.value)} required placeholder="Ej: Ingeniería" />

      <label>Semestre</label>
      <input
        type="number"
        min={1}
        max={12}
        value={semestre}
        onChange={(e) => setSemestre(e.target.value)}
        required
        placeholder="Ej: 5"
      />

      <label>Email</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="correo@ucc.edu.co" />

      <label>Riesgo</label>
      <select value={riesgo} onChange={(e) => setRiesgo(e.target.value)}>
        <option value="BAJO">BAJO</option>
        <option value="MEDIO">MEDIO</option>
        <option value="ALTO">ALTO</option>
      </select>

      <button type="submit">Crear Estudiante</button>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </form>
  );
}