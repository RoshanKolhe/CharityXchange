import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';

import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import zipPlaceholder from '../../assests/placeholders/zip.png';
import CommonSnackBar from '../../common/CommonSnackBar';
import axiosInstance from '../../helpers/axios';

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

const MemberDetails = (props) => {
  const fileInput = React.useRef();
  const idProofInput = React.useRef();
  const addressProofInput = React.useRef();
  const [initialValues, setInitialValues] = useState({
    id: '',
    name: '',
    userProfile: {
      id: '',
      contact: '',
      bio: '',
      avatar: '',
      address: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
      },
      addreesProof: '',
      idProof: '',
    },
    balance_user: {
      id: '',
      payment_info: {
        wallet_address: '',
      },
    },

    email: '',
  });
  const params = useParams();
  const classes = useStyles();
  const location = useLocation();

  const [openSnackBar, setOpenSnackBar] = useState(false);

  const handleCloseSnackBar = () => setOpenSnackBar(false);
  const handleOpenSnackBar = () => setOpenSnackBar(true);

  const [fileName, setFileName] = useState();
  const [src, setSrc] = useState();
  const [file, setFile] = useState();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [preVal, setPreVal] = useState({});
  const navigate = useNavigate();

  const handleNavigate = (url) => {
    navigate(url);
  };

  useEffect(() => {
    axiosInstance.get(`users/${params.id}`).then((result) => {
      setInitialValues(result.data);
      setPreVal(result.data);
    });
  }, [params.id]);

  MemberDetails.propTypes = {
    onDataSubmit: PropTypes.func,
  };
  const validationSchema = yup.object({
    name: yup
      .string('Enter name')
      .required('name is required')
      .test('len', 'Must be less than 20 characters', (val) => {
        if (val) return val.toString().length < 20;
        return true;
      }),
    email: yup.string('Enter email').required('Email is required').email(),
  });
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      await axiosInstance.patch(`users/${params.id}`, values).then((result) => {
        if (result.status === 204) {
          setOpenSnackBar(true);
        }
      });
      props.onDataSubmit();
    },
  });
  const updateMemberDetails = async (event, value) => {
    const fieldvalue = event.target.value;
    const fieldName = event.target.name;
    let newFormValue;
    if (value) {
      newFormValue = { ...formik.values, is_active: formik.values.is_active };
    } else {
      newFormValue = formik.values;
    }
    console.log('newFormValue', newFormValue);
    const inputValues = {
      is_active: newFormValue.is_active,
    };
    // let flag = 0;
    // if (Object.keys(formik.errors).length === 0) {
    //   await axiosInstance.patch(`/users/${params.id}/user-profile`, newFormValue).then((result) => {
    //     if (result.status === 200) {
    //       flag = 1;
    //       setOpenSnackBar(true);
    //     }
    //   });
    // }
    // if (flag === 1) {
    //   return true;
    // }
    // return false;
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
    <Container maxWidth="xl">
      <div>
        <IconButton
          sx={{ padding: 0 }}
          onClick={() => {
            navigate(-1);
          }}
        >
          <KeyboardBackspaceIcon />
          <Typography variant="h6" marginLeft={1}>
            back
          </Typography>
        </IconButton>
        <Typography variant="h4" gutterBottom>
          Member Details
        </Typography>
        <form onSubmit={formik.handleSubmit} id="userForm">
          <Grid container spacing={2}>
            <Grid item xs={12} lg={5} margin={1}>
              <TextField
                InputProps={{ disableUnderline: true }}
                fullWidth
                id="name"
                name="name"
                label="Name"
                type="text"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={(e) => {
                  updateMemberDetails(e);
                }}
                error={Boolean(formik.errors.name)}
                helperText={formik.errors.name}
              />
            </Grid>
            <Grid item xs={12} lg={5} margin={1}>
              <TextField
                InputProps={{ disableUnderline: true }}
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onBlur={(e) => {
                  updateMemberDetails(e);
                }}
                onChange={formik.handleChange}
                error={Boolean(formik.errors.email)}
                helperText={formik.errors.email}
              />
            </Grid>

            <Grid item xs={12} lg={5} margin={1}>
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
            <Grid item xs={12} lg={5} margin={1}>
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
            <Grid item xs={12} lg={5} margin={1}>
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
            <Grid item xs={12} lg={5} margin={1}>
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
            <Grid item xs={12} lg={5} margin={1}>
              <TextField
                InputProps={{ disableUnderline: true }}
                fullWidth
                id="userProfile.address.city"
                name="userProfile.address.city"
                label="City"
                type="text"
                value={formik.values.userProfile.address.city}
                onChange={formik.handleChange}
                error={
                  formik?.touched?.userProfile?.address?.city && Boolean(formik?.errors?.userProfile?.address?.city)
                }
                helperText={formik?.touched?.userProfile?.address?.city && formik?.errors?.userProfile?.address?.city}
              />
            </Grid>
            <Grid item xs={12} lg={5} margin={1}>
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
            <Grid item xs={12} lg={5} margin={1}>
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
                  formik?.touched?.userProfile?.address?.zipCode &&
                  Boolean(formik?.errors?.userProfile?.address?.zipCode)
                }
                helperText={
                  formik?.touched?.userProfile?.address?.zipCode && formik?.errors?.userProfile?.address?.zipCode
                }
              />
            </Grid>
            <Grid item xs={12} lg={11} margin={1}>
              <TextField
                InputProps={{ disableUnderline: true }}
                fullWidth
                id="balance_user.payment_info.wallet_address"
                name="balance_user.payment_info.wallet_address"
                label="Wallet Address"
                type="text"
                value={formik.values.balance_user.payment_info.wallet_address}
                onChange={formik.handleChange}
                error={
                  formik?.touched?.balance_user?.payment_info?.wallet_address &&
                  Boolean(formik?.errors?.balance_user?.payment_info?.wallet_address)
                }
                helperText={
                  formik?.touched?.balance_user?.payment_info?.wallet_address &&
                  formik?.errors?.balance_user?.payment_info?.wallet_address
                }
              />
            </Grid>
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
            <Grid item xs={12} lg={5} margin={1}>
              <FormGroup>
                <FormControlLabel
                  id="is_active"
                  name="is_active"
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    updateMemberDetails(e);
                  }}
                  control={<Switch checked={Boolean(formik.values.is_active)} />}
                  label={formik.values.is_active ? 'Active' : 'InActive'}
                />
                <FormHelperText>Update Active/InActive Status</FormHelperText>
              </FormGroup>
            </Grid>
          </Grid>
        </form>

        <CommonSnackBar
          openSnackBar={openSnackBar}
          handleCloseSnackBar={handleCloseSnackBar}
          msg="Successfully Updated Member Details"
          severity="success"
        />
      </div>
    </Container>
  );
};

export default MemberDetails;
