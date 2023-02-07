import { Box, Button, Grid, Modal, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import * as yup from 'yup';
import { makeStyles } from '@mui/styles';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import CommonSnackBar from '../../common/CommonSnackBar';
import axiosInstance from '../../helpers/axios';
import Iconify from '../iconify/Iconify';

const useStyles = makeStyles((theme) => ({
  containerStyle: {
    display: 'flex',
    alignItems: 'center',
  },
  containerError: {
    border: '2px solid #f44336',
    color: '#f44336',
  },
}));

const PaymentNotificationStrip = ({ icon, message }) => {
  const classes = useStyles();
  const navigate = useNavigate();

  return (
    <>
      <Grid
        container
        direction="row"
        sx={{ display: 'flex', alignItems: 'center', border: '2px solid #f44336', color: '#f44336' }}
      >
        <Grid item xs={2} lg={1}>
          <Iconify width={40} sx={{ paddingLeft: '10px' }} icon={icon} />
        </Grid>
        <Grid item xs={7} lg={8}>
          <Typography variant="subtitle1">{message}</Typography>
        </Grid>
        <Grid item xs={2} lg={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              navigate('/plans');
            }}
          >
            Renew
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default PaymentNotificationStrip;
