import { Box, Button, Grid, Modal, TextField, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import * as yup from 'yup';
import { makeStyles } from '@mui/styles';
import { useFormik } from 'formik';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import CustomBox from './CustomBox';
import CommonSnackBar from './CommonSnackBar';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export const WarningPopup = ({ open, data, handleClose, handleSubmit }) => {
  const [openSnackBar, setOpenSnackBar] = useState(false);

  const classes = useStyles();
  return (
    <>
      <Modal open={open} onClose={handleClose} className={classes.modal}>
        <Modal open={open} onClose={handleClose}>
          <CustomBox>
            <div>
              <>
                <h2>Payment Confirmation</h2>
                <Grid container direction="column">
                  <Grid item xs={12}>
                    <Grid container direction="row">
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: '#36CD71' }}>
                          Type
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          {data.type}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container direction="row">
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: '#36CD71' }}>
                          Amount
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          {data.amount}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" gutterBottom>
                      {`Note*: ${data.amount} will be deducted from your account. Once payment is completed, it cannot be
                      undone.`}
                    </Typography>
                  </Grid>
                </Grid>
                <Button
                  onClick={() => {
                    handleSubmit();
                  }}
                >
                  Confirm Payment
                </Button>
              </>
            </div>
          </CustomBox>
        </Modal>
      </Modal>
    </>
  );
};
