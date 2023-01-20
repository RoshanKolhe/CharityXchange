import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Button,
  TextField,
  Grid,
  Typography,
  // MenuItem,
  // FormHelperText,
  // FormControl,
  // InputLabel,
  // Select,
  Autocomplete,
  Box,
  FormLabel,
  IconButton,
  Avatar,
} from '@mui/material';
import { omit } from 'lodash';
import axiosInstance from '../../helpers/axios';
import account from '../../_mock/account';
import CommonSnackBar from '../../common/CommonSnackBar';

const ProfileForm = ({ initialValues }) => {
  const fileInput = React.useRef();

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [fileName, setFileName] = useState();
  const [src, setSrc] = useState();
  const [file, setFile] = useState();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const profileFormValidationSchema = yup.object({
    name: yup
      .string('Enter name')
      .required('name is required')
      .test('len', 'Must be less than 20 characters', (val) => {
        if (val) return val.toString().length < 20;
        return true;
      }),
    userProfile: yup.object({
      contact: yup.number('Enter Contact Number').test('len', 'Must be  10 characters', (val) => {
        if (val) return val.toString().length < 11;
        return true;
      }),
    }),
    balances: yup.object({
      name: yup
        .string('Enter name')
        .required('name is required')
        .test('len', 'Must be less than 20 characters', (val) => {
          if (val) return val.toString().length < 20;
          return true;
        }),
      wallet_address: yup.string('Enter Public Key').required('Public Key is required'),
    }),
  });

  const formik = useFormik({
    initialValues: {
      id: initialValues?.id,
      name: initialValues?.name || '',
      userProfile: {
        id: initialValues?.userProfile?.id,
        contact: initialValues?.userProfile?.contact || '',
        bio: initialValues?.userProfile?.bio || '',
        avatar: initialValues?.userProfile?.avatar || '',
      },
      balances: {
        id: initialValues?.balances?.id || '',

        payment_info: {
          wallet_address: initialValues?.balances?.payment_info?.wallet_address || '',
        },
      },
      email: initialValues.email || '',
    },
    enableReinitialize: true,
    profileFormValidationSchema,
    onSubmit: async (values) => {
      console.log('values', values);
      if (values.userProfile.id === undefined) {
        values = omit(values, 'userProfile.id');
      }
      if (values.balances.id === undefined) {
        values = omit(values, 'balances.id');
      }
      axiosInstance
        .patch(`/users/${values.id}/user-profile`, values)
        .then((res) => {
          setErrorMessage('');
          setSuccessMessage('Profile Updated Successfully');
          handleOpenSnackBar();
        })
        .catch((err) => {
          setErrorMessage(err.response.data.error.message);
          handleOpenSnackBar();
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
      formData.append('userProfile.avatar', file, file.name);
      axiosInstance
        .post('files', formData)
        .then((res) => {
          formik.setFieldValue('userProfile.avatar', res?.data?.files[0]);
        })
        .catch((err) => {
          setErrorMessage(err.response.data.error.message);
          handleOpenSnackBar();
        });
    }
  };

  return (
    <div>
      {/* <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          p: 1,
          m: 1,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Profile
        </Typography>
      </Box> */}

      <form onSubmit={formik.handleSubmit} id="profileForm">
        <Grid container sx={{ height: 150 }}>
          <Grid item xs={12} lg={12} display="flex" justifyContent="center" marginLeft="110px">
            <IconButton onClick={() => fileInput.current.click()}>
              <Avatar
                sx={{ width: 130, height: 130 }}
                src={
                  formik?.values?.userProfile.avatar?.originalname
                    ? formik?.values?.userProfile.avatar?.originalname
                    : account.photoURL
                }
                alt="photoURL"
              />
            </IconButton>
            <input
              type="file"
              accept="image/*"
              name="userProfile.avatar"
              onChange={(event) => {
                handleFileUpload(event);
              }}
              ref={fileInput}
              style={{ visibility: 'hidden' }}
            />
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
            Profile
          </Typography>
        </Box>
        <Grid container>
          <Grid item xs={12} lg={5} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
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
          <Grid item xs={12} lg={5} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="userProfile.contact"
              name="userProfile.contact"
              label="Contact Number"
              type="text"
              value={formik.values.userProfile.contact}
              onChange={formik.handleChange}
              error={formik?.touched?.userProfile?.contact && Boolean(formik?.errors?.userProfile?.contact)}
              helperText={formik?.touched?.userProfile?.contact && formik?.errors?.userProfile?.contact}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12} lg={5} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="userProfile.bio"
              name="userProfile.bio"
              label="Bio"
              type="text"
              multiline
              maxRows={4}
              value={formik.values.userProfile.bio}
              onChange={formik.handleChange}
              error={formik?.touched?.userProfile?.bio && Boolean(formik?.errors?.userProfile?.bio)}
              helperText={formik?.touched?.userProfile?.bio && formik?.errors?.userProfile?.bio}
            />
          </Grid>
          <Grid item xs={12} lg={5} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="text"
              disabled
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
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
            Payment Info
          </Typography>
        </Box>
        <Grid container>
          <Grid item xs={12} lg={12} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="balances.payment_info.name"
              name="balances.payment_info.name"
              label="Name"
              type="text"
              value={formik.values?.balances?.payment_info?.name}
              onChange={formik.handleChange}
              error={formik?.touched?.balances?.payment_info?.name && Boolean(formik?.errors?.balances?.payment_info?.name)}
              helperText={formik?.touched?.balances?.payment_info?.name && formik?.errors?.balances?.payment_info?.name}
            />
          </Grid>
          <Grid item xs={12} lg={12} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="balances.payment_info.wallet_address"
              name="balances.payment_info.wallet_address"
              label="Wallet Address"
              type="text"
              value={formik.values.balances.payment_info.wallet_address}
              onChange={formik.handleChange}
              error={formik?.touched?.balances?.payment_info?.wallet_address && Boolean(formik?.errors?.balances?.payment_info?.wallet_address)}
              helperText={formik?.touched?.balances?.payment_info?.wallet_address && formik?.errors?.balances?.payment_info?.wallet_address}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item margin={2}>
            <Button color="primary" variant="contained" fullWidth type="submit" form="profileForm">
              Submit
            </Button>
          </Grid>
        </Grid>
        <CommonSnackBar
          openSnackBar={openSnackBar}
          handleCloseSnackBar={handleCloseSnackBar}
          msg={errorMessage !== '' ? errorMessage : successMessage}
          severity={errorMessage !== '' ? 'error' : 'success'}
        />
      </form>
    </div>
  );
};

export default ProfileForm;
