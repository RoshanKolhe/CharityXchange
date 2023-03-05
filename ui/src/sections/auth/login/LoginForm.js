/* eslint-disable react/jsx-no-duplicate-props */
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { Icon } from '@iconify/react';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { LoadingButton } from '@mui/lab';
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

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [isOtpSend, setIsOtpSend] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password is too short - should be 8 chars minimum.')
      .matches(
        // eslint-disable-next-line no-useless-escape
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character'
      ),
    otp: Yup.string().required('OTP is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      otp: '',
      remember: true,
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      const { email, password } = values;
      const isVerified = await verifyOtp(values);
      console.log('isVerified', isVerified);
      if (isVerified) {
        axiosInstance
          .post(`users/login`, { email, password })
          .then((response) => {
            const { data } = response;
            if (data && data.token && data?.user?.is_active) {
              localStorage.setItem('token', data?.token);
              localStorage.setItem('isAuthenticated', true);
              localStorage.setItem('is_kyc_completed', data?.user?.is_kyc_completed);
              localStorage.setItem('permissions', data?.user?.permissions);
              localStorage.setItem('username', data?.user?.name);
              localStorage.setItem('email', data?.user?.email);
              if (data?.user?.permissions?.includes('super_admin')) {
                navigate('/dashboard', { replace: true });
                return;
              }
              if (data?.user?.is_kyc_completed === 0) {
                navigate('/kyc', { replace: true });
              } else if (data?.user?.is_kyc_completed === 1) {
                setErrorMessage('KYC is under review you will be notified by email once the KYC is approved');
                handleOpenSnackBar();
                authService.logout();
              } else if (data?.user?.is_kyc_completed === 2) {
                navigate('/dashboard', { replace: true });
              } else if (data?.user?.is_kyc_completed === 3) {
                setErrorMessage('Your KYC is declined please contact admin');
                handleOpenSnackBar();
                authService.logout();
              }
              values.isSubmitting = false;
            } else {
              setErrorMessage('User is inactive');
              handleOpenSnackBar();
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
      axiosInstance.post('/sendOtp', inputData).then((res) => {
        if (res.data.success) {
          setIsOtpSend(true);
        }
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

    return data;
  };

  return (
    <Container maxWidth="xl">
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          {isOtpSend ? (
            <Stack spacing={3}>
              <IconButton
                sx={{ padding: 0, display: 'flex', justifyContent: 'start', backgroundColor: 'transparent' }}
                disableRipple
                onClick={() => {
                  setIsOtpSend(false);
                }}
              >
                <KeyboardBackspaceIcon />
                <Typography variant="h6" marginLeft={1}>
                  back
                </Typography>
              </IconButton>
              <TextField
                InputProps={{ disableUnderline: true }}
                fullWidth
                type="otp"
                label="OTP"
                {...getFieldProps('otp')}
                error={Boolean(touched.otp && errors.otp)}
                helperText={touched.otp && errors.otp}
              />
            </Stack>
          ) : (
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

              <TextField
                fullWidth
                autoComplete="current-password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                {...getFieldProps('password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleShowPassword} edge="end">
                        <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  disableUnderline: true,
                }}
                error={Boolean(touched.password && errors.password)}
                helperText={touched.password && errors.password}
                inputProps={{
                  'data-testid': 'password-input',
                }}
              />
            </Stack>
          )}

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
            {/* <FormControlLabel
              control={<Checkbox {...getFieldProps('remember')}  />}
              label="Remember me"
            /> */}

            <Link component={RouterLink} variant="subtitle2" to="/forgetPassword">
              Forgot password?
            </Link>
          </Stack>
          {isOtpSend ? (
            <LoadingButton
              fullWidth
              size="large"
              onClick={formik.handleSubmit}
              variant="contained"
              loading={isSubmitting}
              sx={{ marginTop: '1rem' }}
            >
              Login
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
