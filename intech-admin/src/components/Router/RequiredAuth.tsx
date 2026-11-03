import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../state';

export function RequiredAuth() {
  const { session, checking } = useAppSelector(state => state.auth);
  if (checking) return <div className="auth-page"><div className="auth-check">Vérification de la session InTech…</div></div>;
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}
