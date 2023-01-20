/* eslint-disable react/jsx-no-duplicate-props */
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { Icon } from '@iconify/react';
import { LoadingButton } from '@mui/lab';
// material
import { Container, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import { Form, FormikProvider, useFormik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import CommonSnackBar from '../../../common/CommonSnackBar';
import axiosInstance from '../../../helpers/axios';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
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
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      remember: true,
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      const { email, password } = values;
      axiosInstance
        .post(`users/login`, { email, password })
        .then((response) => {
          const { data } = response;
          if (data && data.token && data?.user?.is_active) {
            localStorage.setItem('token', data?.token);
            localStorage.setItem('isAuthenticated', true);
            localStorage.setItem('permissions', data?.user?.permissions);
            localStorage.setItem('username', data?.user?.name);
            localStorage.setItem('email', data?.user?.email);
            navigate('/dashboard', { replace: true });
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
    },
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <Container maxWidth="xl">
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
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

          {/* <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
            <FormControlLabel
              control={<Checkbox {...getFieldProps('remember')} checked={values.remember} />}
              label="Remember me"
            />

            <Link component={RouterLink} variant="subtitle2" to="#">
              Forgot password?
            </Link>
          </Stack> */}

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{ marginTop: '1rem' }}
          >
            Login
          </LoadingButton>
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
