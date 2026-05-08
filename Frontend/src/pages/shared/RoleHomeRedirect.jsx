import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function RoleHomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'hr' ? '/hr/dashboard' : '/notifications'} replace />;
}

export default RoleHomeRedirect;
