import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
// components
import Iconify from '../components/iconify';
// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppCurrentSubject,
  AppConversionRates,
} from '../sections/@dashboard/app';
import DashboardAdminPage from './DashboardAdminPage';
import DashboardEmployeePage from './DashboardEmployeePage';

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const theme = useTheme();
  const role = localStorage.getItem('permissions');
  const permissions = role && role.split(',');
  return <>{permissions && permissions.includes('super_admin') ? <DashboardAdminPage /> : <DashboardEmployeePage />}</>;
}
