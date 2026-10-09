import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = localStorage.getItem('user');
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}