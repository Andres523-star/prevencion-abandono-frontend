import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DetalleEstudiante from './pages/DetalleEstudiante';
import Reportes from './pages/Reportes';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function Navbar() {
  const navigate = useNavigate();
  const user = localStorage.getItem('user');
  const userData = user ? JSON.parse(user) : null;

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>🎓</span>
        Prevención Abandono
      </div>
      <div className="navbar-links">
        {userData ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/reportes">Reportes</Link>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              {userData.nombre}
            </span>
            <button onClick={logout} style={{ padding: '6px 12px', fontSize: 13 }}>
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/estudiante/:id" element={<ProtectedRoute><DetalleEstudiante /></ProtectedRoute>} />
        <Route path="/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;