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
import { useEffect, useState } from 'react';
import { Link as RouterLink, Link, useNavigate, useLocation } from 'react-router-dom';

import * as Yup from 'yup';
import authService from '../../../services/auth.service';
import CommonSnackBar from '../../../common/CommonSnackBar';
import axiosInstance from '../../../helpers/axios';

// ----------------------------------------------------------------------

export default function ChangePasswordForm({ key }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const location = useLocation();
  const [keyData, setKeyData] = useState();

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [isOtpSend, setIsOtpSend] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const ChangePasswordSchema = Yup.object().shape({
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password is too short - should be 8 chars minimum.')
      .matches(
        // eslint-disable-next-line no-useless-escape
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character'
      ),
    passwordConfirmation: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const formik = useFormik({
    initialValues: {
      password: '',
      passwordConfirmation: '',
    },
    validationSchema: ChangePasswordSchema,
    onSubmit: async (values) => {
      if (values.password !== values.passwordConfirmation) {
        formik.setFieldError('passwordConfirmation', 'Password Doesnt match');
        return;
      }
      if (keyData) {
        axiosInstance
          .post(`resetPassword/${keyData}`, {
            password: values.password,
            passwordConfirmation: values.passwordConfirmation,
          })
          .then((response) => {
            const { data } = response;
            if (data?.success) {
              navigate(`/login`);
            }
          })
          .catch((err) => {
            setErrorMessage(err.response.data.error.message);
            handleOpenSnackBar();
          });
      } else {
        setErrorMessage('Something went Wrong');
        handleOpenSnackBar();
      }
    },
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };
  const handleShowPassword1 = () => {
    setShowPassword1((show) => !show);
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('key');
    console.log(id);
    setKeyData(id);
  }, [location]);

  return (
    <Container maxWidth="xl">
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={3}>
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

            <TextField
              fullWidth
              autoComplete="current-password"
              type={showPassword1 ? 'text' : 'password'}
              label="Confirm Password"
              {...getFieldProps('passwordConfirmation')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleShowPassword1} edge="end">
                      <Icon icon={showPassword1 ? eyeFill : eyeOffFill} />
                    </IconButton>
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
              error={Boolean(touched.passwordConfirmation && errors.passwordConfirmation)}
              helperText={touched.passwordConfirmation && errors.passwordConfirmation}
              inputProps={{
                'data-testid': 'password-input',
              }}
            />
          </Stack>

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
