import { Navigate } from 'react-router-dom';

export const PrivateRoutes = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default PrivateRoutes;
