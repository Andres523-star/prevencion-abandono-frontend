import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validarPassword = (p: string) => {
    if (p.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(p)) return 'Debe tener al menos una mayúscula';
    if (!/[0-9]/.test(p)) return 'Debe tener al menos un número';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(p)) return 'Debe tener al menos un símbolo (!@#$%^&*)';
    return '';
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validarPassword(password);
    if (err) {
      setError(err);
      return;
    }
    try {
      const user = await authService.register(nombre, apellido, email, password);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al registrarse');
    }
  };

  return (
    <div className="auth-container">
      <form className="form-card" onSubmit={enviar}>
        <h3>Crear Cuenta</h3>

        <label>Nombre</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <label>Apellido</label>
        <input
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
        />

        <label>Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Contraseña</label>
        <div style={{ position: 'relative' }}>
          <input
            type={verPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ paddingRight: 40 }}
          />
          <span
            onClick={() => setVerPass(!verPass)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#64748b',
            }}
          >
            {verPass ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </span>
        </div>

        <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
          Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.
        </p>

        {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}

        <button type="submit">Registrarse</button>

        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}