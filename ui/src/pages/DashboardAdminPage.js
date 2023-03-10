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
  const [isTodaysProfit, setIsTodaysProfit] = useState(false);
  const [todaysProfit, setTodaysProfit] = useState();

  useEffect(() => {
    axiosInstance.get('users/me').then((res) => {
      setUserProfile(res.data);
    });

    axiosInstance.get('getTodaysBusiness').then((res) => {
      setTodaysProfit(res.data);
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
              total={`${userProfile?.adminBalances?.total_help_received}`}
              color="info"
              icon={'ant-design:apple-filled'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Total Help Send"
              total={`${userProfile?.adminBalances?.total_help_send}`}
              color="warning"
              icon={'ant-design:windows-filled'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Link Active Wallet"
              total={`${userProfile?.adminBalances?.activation_help}`}
              color="error"
              icon={'ant-design:bug-filled'}
            />
          </Grid>
        </Grid>
        <Typography
          variant="body1"
          sx={{ my: 5 }}
          style={{
            color: 'blue',
            cursor: 'pointer',
          }}
          onClick={() => {
            setIsTodaysProfit(!isTodaysProfit);
          }}
        >
          Today's Profit
        </Typography>
        {isTodaysProfit ? (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Plan Bought Count"
                total={`${todaysProfit?.planBoughtCount}`}
                icon={'fluent:text-word-count-20-regular'}
                isText
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Total Plan Bought"
                total={`${todaysProfit?.planBoughtTotal}`}
                icon={'ic:twotone-attach-money'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Link Activation Count"
                total={`${todaysProfit?.linkActivationCount}`}
                icon={'fluent:text-word-count-20-regular'}
                isText
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Link Activation Total"
                total={`${todaysProfit?.linkActivationTotal}`}
                icon={'ic:twotone-attach-money'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Link Help Count"
                total={`${todaysProfit?.linkHelpCount}`}
                icon={'fluent:text-word-count-20-regular'}
                isText
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Link Help Total"
                total={`${todaysProfit?.linkHelpTotal}`}
                icon={'ic:twotone-attach-money'}
              />
            </Grid>
          </Grid>
        ) : null}

        <Grid container spacing={3} mt={3}>
          <Grid item xs={12} sm={12} md={12}>
            <TransactionsAdminPage />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
