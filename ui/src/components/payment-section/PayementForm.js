import { Box, Button, Grid, Modal, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import * as yup from 'yup';
import { makeStyles } from '@mui/styles';
import { useFormik } from 'formik';
import CommonSnackBar from '../../common/CommonSnackBar';
import axiosInstance from '../../helpers/axios';

const useStyles = makeStyles((theme) => ({
  barcodeImg: {
    maxWidth: '100%',
    [theme.breakpoints.down('xs')]: {
      maxWidth: '80%',
    },
  },
}));

const PaymentForm = ({
  userData,
  handleClose,
  userProfile,
  setSuccessMessage,
  setErrorMessage,
  handleOpenSnackBar,
}) => {
  const classes = useStyles();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [fileName, setFileName] = useState();
  const [src, setSrc] = useState();
  const [file, setFile] = useState();

  const paymentFormValidationSchema = yup.object({
    transaction_id: yup.string('Transaction Id').required('Transaction id is required'),
    payment_screen_shot: yup.object().required('Payment Screen Shot is required'),
  });

  const formik = useFormik({
    initialValues: {
      payment_screen_shot: '',
      transaction_id: '',
    },
    enableReinitialize: true,
    validationSchema: paymentFormValidationSchema,
    onSubmit: async (values) => {
      console.log(values);
      axiosInstance
        .post(`users/${userProfile.id}/token-requests`, values)
        .then((res) => {
          setSuccessMessage('Request Sent Successfully');
          handleOpenSnackBar();
          setErrorMessage('');
          handleClose();
        })
        .catch((err) => {
          handleOpenSnackBar();
          setSuccessMessage('');
          setErrorMessage(err);
          handleClose();
        });
    },
  });

  const handleFileUpload = (event) => {
    const reader = new FileReader();
    const file = event.target.files[0];
    if (file) {
      reader.onloadend = () => setFileName(file.name);
      if (file.name !== fileName) {
        reader.readAsDataURL(file);
        setSrc(reader);
        setFile(file);
      }
      const formData = new FormData();
      formData.append('file', file, file.name);
      axiosInstance
        .post('files', formData)
        .then((res) => {
          formik.setFieldValue('payment_screen_shot', res?.data?.files[0]);
        })
        .catch((err) => {
          setErrorMessage(err.response.data.error.message);
          handleOpenSnackBar();
        });
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center">
            <img src={userData?.payment_info?.qr_code?.originalname} alt="Barcode" className={classes.barcodeImg} />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TextField label="Public Key" value={userData?.payment_info?.public_key} fullWidth disabled />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">
            To complete the payment, scan the barcode at a compatible scanner or enter the text manually. After the
            payment is successfully processed, take a screenshot to provide proof of payment.
          </Typography>
        </Grid>
      </Grid>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          p: 1,
          m: 1,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Transaction Details
        </Typography>
      </Box>
      <form onSubmit={formik.handleSubmit} id="paymentForm">
        <Grid container>
          <Grid item xs={12} lg={11} sx={{ marginTop: '10px' }}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="transaction_id"
              name="transaction_id"
              label="Transaction ID"
              type="text"
              value={formik.values.transaction_id}
              onChange={formik.handleChange}
              error={formik?.touched?.transaction_id && Boolean(formik?.errors?.transaction_id)}
              helperText={formik?.touched?.transaction_id && formik?.errors?.transaction_id}
            />
            <input
              type="file"
              accept="image/*"
              name="payment_screen_shot"
              onChange={(event) => {
                handleFileUpload(event);
              }}
              style={{ marginTop: '10px' }}
            />
          </Grid>
        </Grid>

        <Grid container>
          <Grid item sx={{ marginTop: '10px' }}>
            <Button color="primary" variant="contained" fullWidth type="submit" form="paymentForm">
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default PaymentForm;
