import { Navigate, useNavigate, useRoutes } from 'react-router-dom';
// layouts
import { useEffect } from 'react';
import DashboardLayout from '../layouts/dashboard';
//
import BlogPage from '../pages/BlogPage';
import UserPage from '../pages/UserPage';
import LoginPage from '../pages/LoginPage';
import Page404 from '../pages/Page404';
import ProductsPage from '../pages/ProductsPage';
import DashboardAppPage from '../pages/DashboardAppPage';
import ProfilePage from '../pages/ProfilePage';
// eslint-disable-next-line import/no-named-as-default
import PrivateRoutes from './PrivateRoute';
import { RolesAuthRoute } from './RolesAuthRoute';
// ----------------------------------------------------------------------

export default function Router({ role }) {
  console.log(role);
  const navigate = useNavigate();
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, []);

  const routes = useRoutes([
    {
      path: '/',
      element: <PrivateRoutes />,
      children: [
        {
          path: '/',
          element: <DashboardLayout />,
          children: [
            { path: '/dashboard', element: <DashboardAppPage /> },
            {
              path: 'members',
              element: (
                <RolesAuthRoute roles={['super_admin']}>
                  <UserPage />
                </RolesAuthRoute>
              ),
            },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'products', element: <ProductsPage /> },
            { path: 'blog', element: <BlogPage /> },
          ],
        },
      ],
    },
    { path: '/login', element: <LoginPage /> },
    {
      path: '*',
      element: <Page404 />,
    },
    {
      path: '/404',
      element: <Page404 />,
    },
  ]);

  return routes;
}
