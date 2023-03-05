/* eslint-disable react/jsx-no-duplicate-props */
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { Icon } from '@iconify/react';
import { LoadingButton } from '@mui/lab';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

// material
import {
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Form, FormikProvider, useFormik } from 'formik';
import { useState } from 'react';
import { Link as RouterLink, Link, useNavigate } from 'react-router-dom';

import * as Yup from 'yup';
import authService from '../../../services/auth.service';
import CommonSnackBar from '../../../common/CommonSnackBar';
import axiosInstance from '../../../helpers/axios';

// ----------------------------------------------------------------------

export default function ForgetPasswordForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [isOtpSend, setIsOtpSend] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const ForgetPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      otp: '',
    },
    validationSchema: ForgetPasswordSchema,
    onSubmit: async (values) => {
      const { email, password } = values;
      const isVerified = verifyOtp(values);
      if (isVerified) {
        axiosInstance
          .post(`updateResetKey`, { email })
          .then((response) => {
            const { data } = response;
            console.log(data);
            if (data?.success && data?.key) {
              const id = data?.key;
              navigate(`/changePassword?key=${id}`);
            }
          })
          .catch((err) => {
            setErrorMessage(err.response.data.error.message);
            handleOpenSnackBar();
          });
      }
    },
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const sendOtp = () => {
    if (formik.values.email) {
      const inputData = {
        email: formik.values.email,
      };
      axiosInstance
        .post('/sendOtp', inputData)
        .then((res) => {
          if (res.data.success) {
            setIsOtpSend(true);
          }
        })
        .catch((err) => {
          setErrorMessage(err.response.data.error.message);
          handleOpenSnackBar();
        });
    } else {
      setIsOtpSend(false);
    }
  };

  const verifyOtp = async (values) => {
    let data = false;
    if (values.email) {
      const inputData = {
        email: values.email,
        otp: values.otp,
      };
      await axiosInstance.post('/verifyOtp', inputData).then((res) => {
        if (res.data.success) {
          data = true;
        } else {
          formik.setFieldError('otp', "OTP Doesn't match");
          data = false;
        }
      });
    } else {
      setIsOtpSend(false);
      data = false;
    }
    if (data) {
      return true;
    }
    return false;
  };

  return (
    <Container maxWidth="xl">
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <IconButton
            sx={{
              padding: 0,
              display: 'flex',
              justifyContent: 'start',
              backgroundColor: 'transparent',
              marginBottom: '20px',
            }}
            disableRipple
            onClick={() => {
              navigate(-1);
            }}
          >
            <KeyboardBackspaceIcon />
            <Typography variant="h6" marginLeft={1}>
              back
            </Typography>
          </IconButton>

          <Stack spacing={3}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              autoComplete="username"
              type="email"
              label="Email address"
              {...getFieldProps('email')}
              error={Boolean(touched.email && errors.email)}
              helperText={touched.email && errors.email}
              inputProps={{
                'data-testid': 'email-input',
              }}
            />
            {isOtpSend ? (
              <TextField
                InputProps={{ disableUnderline: true }}
                fullWidth
                type="otp"
                label="OTP"
                {...getFieldProps('otp')}
                error={Boolean(touched.otp && errors.otp)}
                helperText={touched.otp && errors.otp}
              />
            ) : null}
          </Stack>

          {/* <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
            <FormControlLabel
              control={<Checkbox {...getFieldProps('remember')}  />}
              label="Remember me"
            />

            <Link component={RouterLink} variant="subtitle2" to="#">
              Forgot password?
            </Link>
          </Stack> */}
          {isOtpSend ? (
            <LoadingButton
              fullWidth
              size="large"
              onClick={formik.handleSubmit}
              variant="contained"
              loading={isSubmitting}
              sx={{ marginTop: '1rem' }}
            >
              Submit
            </LoadingButton>
          ) : (
            <LoadingButton
              fullWidth
              size="large"
              variant="contained"
              loading={isSubmitting}
              sx={{ marginTop: '1rem' }}
              onClick={() => {
                sendOtp();
              }}
            >
              Send OTP
            </LoadingButton>
          )}
        </Form>
      </FormikProvider>

      <CommonSnackBar
        openSnackBar={openSnackBar}
        handleCloseSnackBar={handleCloseSnackBar}
        msg={errorMessage}
        severity="error"
      />
    </Container>
  );
}
