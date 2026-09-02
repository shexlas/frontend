import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SuperAdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-gray-400">Loading...</div>;
  if (!user || user.role !== 'SUPER_ADMIN') return <Navigate to="/" replace />;
  return children;
}
