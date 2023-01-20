import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const PrivateRoutes = () => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  console.log('isAuthenticated', isAuthenticated);
  if (isAuthenticated === undefined || isAuthenticated === null) {
    return null; // or loading indicator/spinner/etc
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};

export default PrivateRoutes;
