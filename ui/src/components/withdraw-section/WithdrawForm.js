import {
  Box,
  Button,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import * as yup from 'yup';
import { makeStyles } from '@mui/styles';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
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

const WithdrawForm = ({
  handleClose,
  userProfile,
  setSuccessMessage,
  setErrorMessage,
  handleOpenSnackBar,
  handleReload,
}) => {
  const classes = useStyles();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [fileName, setFileName] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [src, setSrc] = useState();
  const [file, setFile] = useState();

  const withdrawFormValidationSchema = yup.object({
    details: yup.string('Details').required('Note is required'),
    amount: yup.number().required('Amount is required'),
  });

  const formik = useFormik({
    initialValues: {
      details: '',
      amount: '',
    },
    enableReinitialize: true,
    validationSchema: withdrawFormValidationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      values = {
        details: values.details,
        amount: values.amount,
      };
      axiosInstance
        .post(`/users/withdraws`, values)
        .then((res) => {
          setIsSubmitting(false);
          setSuccessMessage('Request Sent Successfully');
          handleOpenSnackBar();
          setErrorMessage('');
          handleClose();
          handleReload();
        })
        .catch((err) => {
          setIsSubmitting(false);
          handleOpenSnackBar();
          setSuccessMessage('');
          setErrorMessage(err);
          handleClose();
          handleReload();
        });
    },
  });

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          p: 1,
          m: 1,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Withdraw Request
        </Typography>
      </Box>
      <form onSubmit={formik.handleSubmit} id="withdrawForm">
        <Grid container>
          <Grid item xs={12} lg={11} sx={{ marginTop: '5px' }}>
            <TextField
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton edge="start">
                      <Icon icon="material-symbols:attach-money" />
                    </IconButton>
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
              fullWidth
              id="amount"
              name="amount"
              label={`Amount(Available Balance:${userProfile?.balance_user?.current_balance || 0})`}
              type="number"
              sx={{ marginY: '10px' }}
              value={formik.values.amount}
              onChange={formik.handleChange}
              error={formik?.touched?.amount && Boolean(formik?.errors?.amount)}
              helperText={formik?.touched?.amount && formik?.errors?.amount}
            />
          </Grid>
          <Grid item xs={12} lg={11} sx={{ marginTop: '5px' }}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="details"
              name="details"
              label="Note"
              type="text"
              value={formik.values.details}
              onChange={formik.handleChange}
              error={formik?.touched?.details && Boolean(formik?.errors?.details)}
              helperText={formik?.touched?.details && formik?.errors?.details}
            />
          </Grid>
        </Grid>

        <Grid container>
          <Grid item sx={{ marginTop: '10px' }}>
            <LoadingButton
              loading={isSubmitting}
              loadingPosition="start"
              variant="contained"
              startIcon={<SaveIcon />}
              color="primary"
              fullWidth
              type="submit"
              form="withdrawForm"
              disabled={isSubmitting}
            >
              Submit
            </LoadingButton>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default WithdrawForm;
