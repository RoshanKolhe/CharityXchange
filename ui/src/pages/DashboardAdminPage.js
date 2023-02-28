import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography, Modal } from '@mui/material';
// components
import axiosInstance from '../helpers/axios';
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
import CustomBox from '../common/CustomBox';
import PaymentForm from '../components/payment-section/PayementForm';
import TransactionsAdminPage from './TransactionsAdminPage';

// ----------------------------------------------------------------------

export default function DashboardAdminPage() {
  const theme = useTheme();
  const [userProfile, setUserProfile] = useState();

  useEffect(() => {
    axiosInstance.get('users/me').then((res) => {
      setUserProfile(res.data);
    });
  }, []);

  return (
    <>
      <Helmet>
        <title> Dashboard | Admin</title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Remaining Supply"
              total={`${userProfile?.adminBalances?.total_supply}`}
              icon={'ic:twotone-attach-money'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Total Help Received"
              total={`${userProfile?.adminBalances?.total_earnings}`}
              color="info"
              icon={'ant-design:apple-filled'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Total Help Send"
              total={`${userProfile?.adminBalances?.withdrawn_amount}`}
              color="warning"
              icon={'ant-design:windows-filled'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Bug Reports" total={234} color="error" icon={'ant-design:bug-filled'} />
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <TransactionsAdminPage />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
