import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await authService.login(email, password);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (err) {
      setError('Correo o contraseña incorrectos');
    }
  };

  return (
    <div className="auth-container">
      <form className="form-card" onSubmit={enviar}>
        <h3>Iniciar Sesión</h3>
        <label>Correo electrónico</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

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
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)', cursor: 'pointer',
              fontSize: 18, userSelect: 'none'
            }}
          >
            {verPass ? '🙈' : '👁️'}
          </span>
        </div>

        {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
        <button type="submit">Entrar</button>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}