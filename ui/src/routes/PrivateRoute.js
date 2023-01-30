import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const PrivateRoutes = () => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const isKycCompleted = localStorage.getItem('is_kyc_completed');
  console.log('isKycCompleted', isKycCompleted);
  if (isAuthenticated === undefined || isAuthenticated === null) {
    return null; // or loading indicator/spinner/etc
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};

export default PrivateRoutes;
