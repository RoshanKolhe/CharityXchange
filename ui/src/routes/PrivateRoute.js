import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const PrivateRoutes = () => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const isKycCompleted = localStorage.getItem('is_kyc_completed');
  if (isAuthenticated === undefined || isAuthenticated === null) {
    return null; // or loading indicator/spinner/etc
  }

  return isAuthenticated && isKycCompleted === '2' ? (
    <Outlet />
  ) : isKycCompleted === '0' ? (
    <Navigate to="/kyc" replace state={{ from: location }} />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export default PrivateRoutes;
