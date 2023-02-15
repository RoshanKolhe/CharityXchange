/* eslint-disable consistent-return */
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import SaveIcon from '@mui/icons-material/Save';
import {
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Tooltip,
  IconButton,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import closefill from '@iconify/icons-eva/close-fill';
import { LoadingButton } from '@mui/lab';
import axiosInstance from '../../helpers/axios';
import CommonSnackBar from '../../common/CommonSnackBar';

const NewMember = (props) => {
  NewMember.propTypes = {
    onDataSubmit: PropTypes.func,
    handleClose: PropTypes.func,
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = yup.object({
    name: yup
      .string('Enter name')
      .required('name is required')
      .test('len', 'Must be less than 20 characters', (val) => {
        if (val) return val.toString().length < 20;
      }),
    email: yup
      .string('Enter email')
      .required(' email  is required')
      .test('len', 'Must be less than 50 characters', (val) => {
        if (val) return val.toString().length < 50;
      }),
    password: yup
      .string()
      .required('Password is required')
      .min(8, 'Password is too short - should be 8 chars minimum.')
      .matches(
        // eslint-disable-next-line no-useless-escape
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character'
      ),
  });

  const [currentUser, setCurrentUser] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackBar, setOpenSnackBar] = useState(false);

  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      const inputValues = {
        ...values,
        permissions: ['employee'],
        is_active: true,
        is_kyc_completed: 0,
        parent_id: currentUser.id || null,
      };
      axiosInstance
        .post('users/register', inputValues)
        .then((res) => {
          setIsSubmitting(true);
          props.onDataSubmit();
        })
        .catch((err) => {
          setIsSubmitting(false);
          setErrorMessage(err.response.data.error.message);
          handleOpenSnackBar();
        });
    },
  });
  const { errors, touched, handleSubmit, getFieldProps } = formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  useEffect(() => {
    axiosInstance.get('users/me').then((res) => {
      setCurrentUser(res.data);
    });
  }, []);

  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          p: 1,
          m: 1,
        }}
      >
        <Typography variant="h6" gutterBottom>
          New Member
        </Typography>
        <Tooltip password="Close">
          <IconButton onClick={props.handleClose}>
            <Icon icon={closefill} />
          </IconButton>
        </Tooltip>
      </Box>

      <form onSubmit={formik.handleSubmit} id="alertForm">
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Name"
            type="text"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            type="text"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            autoComplete="new-password"
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
        </Grid>

        <LoadingButton
          loading={isSubmitting}
          loadingPosition="start"
          variant="contained"
          startIcon={<SaveIcon />}
          color="primary"
          fullWidth
          type="submit"
          form="alertForm"
          disabled={isSubmitting}
        >
          Submit
        </LoadingButton>
      </form>
      <CommonSnackBar
        openSnackBar={openSnackBar}
        handleCloseSnackBar={handleCloseSnackBar}
        msg={errorMessage}
        severity="error"
      />
    </div>
  );
};

export default NewMember;
