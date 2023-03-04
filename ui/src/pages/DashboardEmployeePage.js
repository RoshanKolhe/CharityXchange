import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography, Button, Modal } from '@mui/material';
// components
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import WithdrawForm from '../components/withdraw-section/WithdrawForm';
import { LEVEL_DATA, LOCK_PRICE } from '../utils/constants';
import PaymentNotificationStrip from '../components/payment-section/Payment-Notification';
import CommonSnackBar from '../common/CommonSnackBar';
import PaymentForm from '../components/payment-section/PayementForm';
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
  AppLevelCard,
} from '../sections/@dashboard/app';
import CustomBox from '../common/CustomBox';
import TransactionsEmployeePage from './TransactionsEmployeePage';

// ----------------------------------------------------------------------

export default function DashboardEmployeePage() {
  const theme = useTheme();
  const [userProfile, setUserProfile] = useState();
  const [openModal, setOpenMdal] = useState(false);
  const [openWithdrawModal, setOpenWithdrawModal] = useState(false);
  const [adminBalancesData, setAdminBalancesData] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleOpen = () => setOpenMdal(true);
  const handleClose = () => setOpenMdal(false);

  const handleOpenWithdrawModal = () => setOpenWithdrawModal(true);
  const handleCloseWithdrawModal = () => setOpenWithdrawModal(false);

  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const getWithdrawableAmount = (userData) => {
    console.log('userData', userData);
    let withdrawableAmount = 0;
    if (
      userData &&
      userData?.balance_user &&
      Object.prototype.hasOwnProperty.call(userData, 'level_cycles_participated')
    ) {
      if (userData.level_cycles_participated > 4) {
        withdrawableAmount = userData.balance_user.current_balance - LOCK_PRICE[userData?.activePayment?.total_links];
      } else {
        withdrawableAmount = userData.balance_user.current_balance;
      }
    }
    console.log('withdrawableAmount', withdrawableAmount);
    return `${withdrawableAmount}`;
  };

  const handleFetchProfile = () => {
    axiosInstance.get('users/me').then((res) => {
      setUserProfile(res.data);
    });
  };

  useEffect(() => {
    handleFetchProfile();
  }, []);

  const handleModalDetailsOpen = () => {
    axiosInstance.get('admin-balances/1').then((res) => {
      setAdminBalancesData(res.data);
      handleOpen();
    });
  };
  return (
    <>
      <Helmet>
        <title> Dashboard | Admin</title>
      </Helmet>

      <Container maxWidth="xl">
        {!userProfile?.activePayment || userProfile?.activePayment === undefined ? (
          <PaymentNotificationStrip
            icon="ic:twotone-warning"
            message="You do not currently have an active package. To start earning, please subscribe to a plan."
            isError
          />
        ) : null}

        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Current Balance"
              total={`${userProfile?.balance_user?.current_balance}`}
              icon={'ic:twotone-attach-money'}
            />
            <Button
              color="primary"
              variant="contained"
              fullWidth
              onClick={() => {
                handleModalDetailsOpen();
              }}
              sx={{ marginTop: '20px' }}
            >
              Request Dollors
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Total Earnings"
              total={`${userProfile?.balance_user?.total_earnings}`}
              color="info"
              icon={'ic:twotone-attach-money'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="CHXT Token"
              total={`${userProfile?.balance_user?.chxtToken === undefined ? 0 : userProfile?.balance_user?.chxtToken}`}
              color="info"
              isText
              icon={'material-symbols:token'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Withdrawable Balance"
              total={getWithdrawableAmount(userProfile)}
              color="warning"
              icon={'bx:money-withdraw'}
            />
            <Button
              color="primary"
              variant="contained"
              fullWidth
              onClick={() => {
                handleOpenWithdrawModal();
              }}
              sx={{ marginTop: '20px' }}
            >
              Withdraw
            </Button>
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppWebsiteVisits
              title="Website Visits"
              subheader="(+43%) than last year"
              chartLabels={[
                '01/01/2003',
                '02/01/2003',
                '03/01/2003',
                '04/01/2003',
                '05/01/2003',
                '06/01/2003',
                '07/01/2003',
                '08/01/2003',
                '09/01/2003',
                '10/01/2003',
                '11/01/2003',
              ]}
              chartData={[
                {
                  name: 'Team A',
                  type: 'column',
                  fill: 'solid',
                  data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                },
                {
                  name: 'Team B',
                  type: 'area',
                  fill: 'gradient',
                  data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                },
                {
                  name: 'Team C',
                  type: 'line',
                  fill: 'solid',
                  data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppLevelCard title="Current Level" subheader={LEVEL_DATA[userProfile?.userLevel?.level] || 'No Level'} />
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <TransactionsEmployeePage />
          </Grid>
        </Grid>
        <Modal
          open={openModal}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <CustomBox>
            <PaymentForm
              userData={adminBalancesData}
              userProfile={userProfile}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
              handleOpenSnackBar={handleOpenSnackBar}
              handleClose={handleClose}
            />
          </CustomBox>
        </Modal>

        <Modal
          open={openWithdrawModal}
          onClose={handleCloseWithdrawModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <CustomBox>
            <WithdrawForm
              userProfile={userProfile}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
              handleOpenSnackBar={handleOpenSnackBar}
              handleClose={handleCloseWithdrawModal}
              handleReload={handleFetchProfile}
            />
          </CustomBox>
        </Modal>

        <CommonSnackBar
          openSnackBar={openSnackBar}
          handleCloseSnackBar={handleCloseSnackBar}
          msg={errorMessage !== '' ? errorMessage : successMessage}
          severity={errorMessage !== '' ? 'error' : 'success'}
        />
      </Container>
    </>
  );
}
