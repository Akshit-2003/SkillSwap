import { Navigate, useLocation } from 'react-router-dom';
import { getHomeRouteForUser, getStoredUser, hasRequiredRole } from '../utils/auth';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation();
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasRequiredRole(user, allowedRoles)) {
    return <Navigate to={getHomeRouteForUser(user)} replace />;
  }

  return children;
};

export default ProtectedRoute;
