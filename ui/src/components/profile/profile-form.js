import React, { useState, useEffect } from 'react';
import { Field, useFormik } from 'formik';
import * as yup from 'yup';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import {
  FormHelperText,
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
  Modal,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

import { omit } from 'lodash';
import { makeStyles } from '@mui/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomBox from '../../common/CustomBox';
import axiosInstance from '../../helpers/axios';
import account from '../../_mock/account';
import CommonSnackBar from '../../common/CommonSnackBar';
import zipPlaceholder from '../../assests/placeholders/zip.png';
import authService from '../../services/auth.service';

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    marginTop: theme.spacing(3),
  },
  input: {
    display: 'none',
  },
  uploadButton: {
    marginTop: theme.spacing(2),
  },
  uploadIcon: {
    marginRight: theme.spacing(1),
  },
  uploadedFile: {
    marginTop: theme.spacing(2),
  },
}));

const TermsAndConditionsModal = ({ handleAccept }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <span>
        I agree to <Button onClick={handleOpen}>Terms and conditions</Button>
      </span>
      <Modal open={open} onClose={handleClose}>
        <CustomBox>
          <div>
            <h2>Terms and Conditions</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt leo id ex blandit, non congue
              quam vehicula. Curabitur facilisis erat quis semper feugiat. Sed vel nisl vel velit scelerisque tempor.
              Nam aliquet, diam vel sollicitudin volutpat, ex diam commodo mi, id blandit nulla odio eu nibh. Fusce quis
              justo euismod, faucibus libero in, efficitur sapien. Lorem ipsum dolor sit amet, consectetur adipiscing
              elit. Nullam tincidunt leo id ex blandit, non congue quam vehicula. Curabitur facilisis erat quis semper
              feugiat. Sed vel nisl vel velit scelerisque tempor. Nam aliquet, diam vel sollicitudin volutpat, ex diam
              commodo mi, id blandit nulla odio eu nibh. Fusce quis justo euismod, faucibus libero in, efficitur sapien.
            </p>
            <Button
              onClick={() => {
                handleAccept();
                handleClose();
              }}
            >
              Accept
            </Button>
          </div>
        </CustomBox>
      </Modal>
    </>
  );
};

const ProfileForm = ({ initialValues }) => {
  const fileInput = React.useRef();
  const idProofInput = React.useRef();
  const addressProofInput = React.useRef();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [fileName, setFileName] = useState();
  const [src, setSrc] = useState();
  const [file, setFile] = useState();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [idProof, setIdProof] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
      contact: yup.string('Enter Contact Number').required('Contact is required'),
      address: yup.object({
        addressLine1: yup.string('Enter Address Line 1').required('Address Line 1 is required'),
        addresLine2: yup.string('Enter Address Line 2'),
        country: yup.string('Enter Country').required('Country is required'),
        city: yup.string('Enter City').required('City is required'),
        state: yup.string('Enter State').required('State is required'),
        zipCode: yup.string('Enter Zip Code').required('Zip Code is required'),
      }),
      addreesProof: yup.object().required('Address Proof is required'),
      idProof: yup.object().required('Id Proof is required'),
    }),

    balances: yup.object({
      payment_info: yup.object({
        wallet_address: yup.string('Enter Public Key').required('Public Key is required'),
      }),
    }),
    // terms: yup.boolean().when('', {
    //   is: () => location.pathname === '/kyc',
    //   then: yup.string().required('Please accept terms and condition'),
    //   otherwise: yup.string().notRequired(),
    // }),
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
        address: {
          addressLine1: initialValues?.userProfile?.address?.addressLine1 || '',
          addressLine2: initialValues?.userProfile?.address?.addressLine2 || '',
          country: initialValues?.userProfile?.address?.country || '',
          city: initialValues?.userProfile?.address?.city || '',
          state: initialValues?.userProfile?.address?.state || '',
          zipCode: initialValues?.userProfile?.address?.zipCode || '',
        },
        addreesProof: initialValues?.userProfile?.addreesProof || '',
        idProof: initialValues?.userProfile?.idProof || '',
      },
      balances: {
        id: initialValues?.balance_user?.id || '',
        payment_info: {
          wallet_address: initialValues?.balance_user?.payment_info?.wallet_address || '',
        },
      },

      email: initialValues.email || '',
      terms: initialValues.terms || false,
    },
    enableReinitialize: true,
    validationSchema: profileFormValidationSchema,
    onSubmit: async (values) => {
      console.log('values', values);  
      if (values.userProfile.id === undefined || values.userProfile.id === '') {
        values = omit(values, 'userProfile.id');
      }
      if (values.balances.id === undefined || values.balances.id === '') {
        values = omit(values, 'balances.id');
      }
      if (location.pathname === '/kyc') {
        if (!values.terms) {
          formik.setFieldError('terms', 'Please accept the terms and condition to proceed');
          return;
        }
        values = {
          ...values,
          is_kyc_completed: 1,
        };
      }

      axiosInstance
        .patch(`/users/${values.id}/user-profile`, values)
        .then((res) => {
          setErrorMessage('');
          if (location.pathname === '/kyc') {
            setSuccessMessage('KYC data submitted successfully you will be notified by email once the kyc is approved');
            handleOpenSnackBar();
            setTimeout(() => {
              authService.logout();
              navigate('/login', { replace: true });
            }, 3000);
          } else {
            setSuccessMessage('Profile Updated Successfully');
            handleOpenSnackBar();
          }
        })
        .catch((err) => {
          setErrorMessage(err.response.data.error.message);
          handleOpenSnackBar();
        });
    },
  });

  const handleAccept = () => {
    formik.setFieldValue('terms', true);
  };

  const onPhoneValueChange = (phoneNumber) => {
    formik.setFieldValue('userProfile.contact', phoneNumber);
  };

  const handleFileUpload = (event, fileType) => {
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
          if (fileType === 'avatar') {
            formik.setFieldValue('userProfile.avatar', res?.data?.files[0]);
          } else if (fileType === 'addreesProof') {
            formik.setFieldValue('userProfile.addreesProof', res?.data?.files[0]);
          } else if (fileType === 'idProof') {
            formik.setFieldValue('userProfile.idProof', res?.data?.files[0]);
          }
        })
        .catch((err) => {
          setErrorMessage(err.response.data.error.message);
          handleOpenSnackBar();
        });
    }
  };

  return (
    <div>
      <form onSubmit={formik.handleSubmit} id="profileForm">
        {location.pathname === '/kyc' ? null : (
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
                  handleFileUpload(event, 'avatar');
                }}
                ref={fileInput}
                style={{ visibility: 'hidden' }}
              />
            </Grid>
          </Grid>
        )}

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
            {/* <TextField
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
            /> */}
            <PhoneInput
              country={'in'}
              value={formik.values.userProfile.contact}
              onChange={(phone) => {
                onPhoneValueChange(phone);
              }}
              inputStyle={{
                width: '100%',
              }}
              placeholder="Phone number"
            />
            <FormHelperText error>
              {formik?.touched?.userProfile?.contact && formik?.errors?.userProfile?.contact}
            </FormHelperText>
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
            Address
          </Typography>
        </Box>
        <Grid container>
          <Grid item xs={12} lg={5} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="userProfile.address.addressLine1"
              name="userProfile.address.addressLine1"
              label="Address Line 1"
              type="text"
              value={formik.values.userProfile.address.addressLine1}
              onChange={formik.handleChange}
              error={
                formik?.touched?.userProfile?.address?.addressLine1 &&
                Boolean(formik?.errors?.userProfile?.address?.addressLine1)
              }
              helperText={
                formik?.touched?.userProfile?.address?.addressLine1 &&
                formik?.errors?.userProfile?.address?.addressLine1
              }
            />
          </Grid>
          <Grid item xs={12} lg={5} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="userProfile.address.addressLine2"
              name="userProfile.address.addressLine2"
              label="Address Line 2"
              type="text"
              value={formik.values.userProfile.address.addressLine2}
              onChange={formik.handleChange}
              error={
                formik?.touched?.userProfile?.address?.addressLine2 &&
                Boolean(formik?.errors?.userProfile?.address?.addressLine2)
              }
              helperText={
                formik?.touched?.userProfile?.address?.addressLine2 &&
                formik?.errors?.userProfile?.address?.addressLine2
              }
            />
          </Grid>
          <Grid item xs={12} lg={5} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="userProfile.address.country"
              name="userProfile.address.country"
              label="Country"
              type="text"
              value={formik.values.userProfile.address.country}
              onChange={formik.handleChange}
              error={
                formik?.touched?.userProfile?.address?.country && Boolean(formik?.errors?.userProfile?.address?.country)
              }
              helperText={
                formik?.touched?.userProfile?.address?.country && formik?.errors?.userProfile?.address?.country
              }
            />
          </Grid>
          <Grid item xs={12} lg={5} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="userProfile.address.city"
              name="userProfile.address.city"
              label="City"
              type="text"
              value={formik.values.userProfile.address.city}
              onChange={formik.handleChange}
              error={formik?.touched?.userProfile?.address?.city && Boolean(formik?.errors?.userProfile?.address?.city)}
              helperText={formik?.touched?.userProfile?.address?.city && formik?.errors?.userProfile?.address?.city}
            />
          </Grid>
          <Grid item xs={12} lg={5} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="userProfile.address.state"
              name="userProfile.address.state"
              label="State"
              type="text"
              value={formik.values.userProfile.address.state}
              onChange={formik.handleChange}
              error={
                formik?.touched?.userProfile?.address?.state && Boolean(formik?.errors?.userProfile?.address?.state)
              }
              helperText={formik?.touched?.userProfile?.address?.state && formik?.errors?.userProfile?.address?.state}
            />
          </Grid>
          <Grid item xs={12} lg={5} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="userProfile.address.zipCode"
              name="userProfile.address.zipCode"
              label="Zip Code"
              type="text"
              value={formik.values.userProfile.address.zipCode}
              onChange={formik.handleChange}
              error={
                formik?.touched?.userProfile?.address?.zipCode && Boolean(formik?.errors?.userProfile?.address?.zipCode)
              }
              helperText={
                formik?.touched?.userProfile?.address?.zipCode && formik?.errors?.userProfile?.address?.zipCode
              }
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
          <Grid item xs={12} lg={11} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="balances.payment_info.wallet_address"
              name="balances.payment_info.wallet_address"
              label="Wallet Address"
              type="text"
              value={formik.values.balances.payment_info.wallet_address}
              onChange={formik.handleChange}
              error={
                formik?.touched?.balances?.payment_info?.wallet_address &&
                Boolean(formik?.errors?.balances?.payment_info?.wallet_address)
              }
              helperText={
                formik?.touched?.balances?.payment_info?.wallet_address &&
                formik?.errors?.balances?.payment_info?.wallet_address
              }
            />
          </Grid>
        </Grid>
        <Grid container className={classes.gridContainer}>
          <Grid item xs={12} lg={5} margin={2}>
            <input
              accept="image/*,application/pdf"
              className={classes.input}
              name="userProfile.idProof"
              id="id-proof"
              type="file"
              ref={idProofInput}
              onChange={(event) => {
                handleFileUpload(event, 'idProof');
              }}
            />

            <Button
              variant="contained"
              color="primary"
              component="span"
              disabled={location.pathname !== '/kyc'}
              className={classes.uploadButton}
              onClick={() => idProofInput.current.click()}
              startIcon={<CloudUploadIcon className={classes.uploadIcon} />}
            >
              ID Proof
            </Button>
            <FormHelperText error>
              {formik?.touched?.userProfile?.idProof && formik?.errors?.userProfile?.idProof}
            </FormHelperText>
            {formik.values?.userProfile?.idProof && (
              <>
                <Box
                  component="img"
                  onClick={() => window.open(formik.values?.userProfile?.idProof?.originalname, '_blank')}
                  sx={{
                    marginTop: 2,
                    height: 200,
                    width: 350,
                    maxHeight: { xs: 233, md: 167 },
                    maxWidth: { xs: 350, md: 250 },
                    cursor: 'pointer',
                    objectFit: 'contain',
                  }}
                  alt="placeholder"
                  src={
                    formik.values?.userProfile?.idProof?.mimetype === 'application/pdf'
                      ? zipPlaceholder
                      : formik.values?.userProfile?.idProof?.originalname
                  }
                />
                <FormHelperText>{formik.values?.userProfile?.idProof?.fileName}</FormHelperText>
              </>
            )}
          </Grid>
          <Grid item xs={12} lg={5} margin={2}>
            <input
              accept="image/*,application/pdf"
              className={classes.input}
              id="address-proof"
              type="file"
              onChange={(event) => {
                handleFileUpload(event, 'addreesProof');
              }}
              ref={addressProofInput}
            />
            <Button
              variant="contained"
              color="primary"
              component="span"
              disabled={location.pathname !== '/kyc'}
              className={classes.uploadButton}
              onClick={() => addressProofInput.current.click()}
              startIcon={<CloudUploadIcon className={classes.uploadIcon} />}
            >
              Address Proof
            </Button>
            <FormHelperText error>
              {formik?.touched?.userProfile?.addreesProof && formik?.errors?.userProfile?.addreesProof}
            </FormHelperText>
            {formik.values?.userProfile?.addreesProof && (
              <>
                <Box
                  component="img"
                  onClick={() => window.open(formik.values?.userProfile?.addreesProof?.originalname, '_blank')}
                  sx={{
                    marginTop: 2,
                    height: 200,
                    width: 350,
                    cursor: 'pointer',
                    maxHeight: { xs: 233, md: 167 },
                    maxWidth: { xs: 350, md: 250 },
                    objectFit: 'contain',
                  }}
                  alt="placeholder"
                  src={
                    formik.values?.userProfile?.addreesProof?.mimetype === 'application/pdf'
                      ? zipPlaceholder
                      : formik.values?.userProfile?.addreesProof?.originalname
                  }
                />
                <FormHelperText>{formik.values?.userProfile?.addreesProof?.fileName}</FormHelperText>
              </>
            )}
          </Grid>
        </Grid>
        {location.pathname !== '/kyc' ? null : (
          <Grid container>
            <Grid item xs={12} lg={11} margin={2}>
              <Checkbox id="terms" name="terms" checked={formik.values.terms} onChange={formik.handleChange} />
              <TermsAndConditionsModal handleAccept={handleAccept} />
              <FormHelperText error>{formik?.touched?.terms && formik?.errors?.terms}</FormHelperText>
            </Grid>
          </Grid>
        )}
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
