import {
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
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import CommonSnackBar from '../../common/CommonSnackBar';
import axiosInstance from '../../helpers/axios';

const MemberDetails = (props) => {
  const [initialValues, setInitialValues] = useState({
    name: '',
    email: '',
    is_active: '',
  });
  const params = useParams();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const handleCloseSnackBar = () => setOpenSnackBar(false);
  const [preVal, setPreVal] = useState({});
  const navigate = useNavigate();

  const handleNavigate = (url) => {
    navigate(url, { replace: true });
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
    console.log(formik.values.is_active);
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

  return (
    <Container maxWidth="xl">
      <div>
        <IconButton
          sx={{ padding: 0 }}
          onClick={() => {
            handleNavigate('/members');
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
            <Grid item xs={5} margin={1}>
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
            <Grid item xs={5} margin={1}>
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
            <Grid item xs={6} margin={1}>
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
