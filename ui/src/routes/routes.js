import { Navigate, useNavigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from '../layouts/dashboard';
//
import BlogPage from '../pages/BlogPage';
import UserPage from '../pages/UserPage';
import LoginPage from '../pages/LoginPage';
import Page404 from '../pages/Page404';
import ProductsPage from '../pages/ProductsPage';
import DashboardAppPage from '../pages/DashboardAppPage';
import ProfilePage from '../pages/ProfilePage';
import ProtectedRoute from './PrivateRoute';

// ----------------------------------------------------------------------

export default function Router({ role }) {
  console.log(role);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (!isAuthenticated) {
    navigate('/login');
  }
  const routes = useRoutes([
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        { path: 'dashboard', element: <DashboardAppPage /> },
        { path: 'user', element: <UserPage /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
      ],
    },
    { path: '/login', element: <LoginPage /> },
    { path: '/404', element: <Page404 /> },

    { path: '*', element: <Navigate to="/404" replace /> },
  ]);

  return routes;
}
