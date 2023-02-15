import { useNavigate, useRoutes } from 'react-router-dom';
// layouts
import React, { useEffect } from 'react';
import CyclesPage from '../pages/CyclesPage';
import AdminReceivedLInks from '../pages/AdminReceivedLInks';
import PricingPlan from '../components/PricingPlans/PricingPlans';
import TokenRequestsAdminPage from '../pages/TokenRequestsAdminPage';
import TokenRequestsEmployeePage from '../pages/TokenRequestsEmployeePage';
import PendingKycPage from '../pages/PendingKycPage';
import MemberDetails from '../components/members/MemberDetails';
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
import KycPage from '../pages/KycPage';
import MemberLinks from '../pages/MemberLInks';

// ----------------------------------------------------------------------

export default function Router({ role }) {
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
                <RolesAuthRoute roles={['super_admin', 'employee']}>
                  <UserPage />
                </RolesAuthRoute>
              ),
            },
            {
              name: 'pendingKyc',
              path: 'pendingKyc',
              element: (
                <RolesAuthRoute roles={['super_admin']}>
                  <PendingKycPage />
                </RolesAuthRoute>
              ),
            },
            { path: 'profile', element: <ProfilePage /> },
            // { path: 'products', element: <ProductsPage /> },
            // { path: 'blog', element: <BlogPage /> },
            {
              name: 'userDetails',
              path: 'users/:id',
              element: (
                <RolesAuthRoute roles={['super_admin']}>
                  <MemberDetails />
                </RolesAuthRoute>
              ),
            },
            {
              name: 'tokenRequests',
              path: 'tokenRequests/:id',
              element: <TokenRequestsEmployeePage />,
            },
            {
              name: 'tokenRequestsAdmin',
              path: 'tokenRequests',
              element: (
                <RolesAuthRoute roles={['super_admin']}>
                  <TokenRequestsAdminPage />{' '}
                </RolesAuthRoute>
              ),
            },
            {
              name: 'Links',
              path: '/userLinks',
              element: <MemberLinks />,
            },
            {
              name: 'AdminReceivedLinks',
              path: '/receivedLinks',
              element: (
                <RolesAuthRoute roles={['super_admin']}>
                  <AdminReceivedLInks />
                </RolesAuthRoute>
              ),
            },
            {
              name: 'AllCycles',
              path: 'cycles',
              element: (
                <RolesAuthRoute roles={['super_admin']}>
                  <CyclesPage />
                </RolesAuthRoute>
              ),
            },
            {
              path: '/plans',
              element: <PricingPlan />,
            },
          ],
        },
      ],
    },
    {
      path: '/',
      element: <PrivateRoutes />,
      children: [
        {
          path: '/kyc',
          element: <KycPage />,
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
