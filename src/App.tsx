import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DetalleEstudiante from './pages/DetalleEstudiante';
import Reportes from './pages/Reportes';

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <div className="navbar-brand">
          <span>🎓</span>
          Prevención Abandono
        </div>
        <div className="navbar-links">
          <Link to="/">Dashboard</Link>
          <Link to="/reportes">Reportes</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/estudiante/:id" element={<DetalleEstudiante />} />
        <Route path="/reportes" element={<Reportes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;