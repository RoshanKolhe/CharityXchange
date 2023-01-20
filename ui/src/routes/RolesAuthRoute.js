import { Fragment } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRoles } from '../utils/constants';

export function RolesAuthRoute({ children, roles }) {
  const userRoles = useUserRoles();

  const canAccess = userRoles.some((userRole) => roles.includes(userRole));
  console.log('canAccess', canAccess);

  if (canAccess) return <>{children}</>;

  return <Navigate to="/404" />;
}
