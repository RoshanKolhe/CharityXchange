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

const ProfileForm = ({ initialValues }) => {
  const fileInput = React.useRef();
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
  });

  const formik = useFormik({
    initialValues: {
      id: initialValues?.id,
      name: initialValues?.name || '',
      userProfile: {
        id: initialValues?.userProfile?.id,
        contact: initialValues?.userProfile?.contact || '',
        bio: initialValues?.userProfile?.bio || '',
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
      axiosInstance.patch(`/users/${values.id}/user-profile`, values).then((res) => {
        console.log(res);
      });
    },
  });
  const [fileName, setFileName] = useState();
  const [src, setSrc] = useState();
  const [file, setFile] = useState();
  console.log('file', file);
  console.log('src', src);

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
      formData.append('avatar', file, file.name);
      axiosInstance.post('attachment', formData).then((res) => {
        console.log(res);
      });
    }
  };

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
          Profile
        </Typography>
      </Box>
      {/* <Grid container>
        <Grid item xs={12}>

        </Grid>
    </Grid> */}
      <form onSubmit={formik.handleSubmit} id="profileForm">
        <Grid container sx={{ height: 150 }}>
          <Grid item xs={12} lg={12} display="flex" justifyContent="center" marginLeft="110px">
            <IconButton onClick={() => fileInput.current.click()}>
              <Avatar
                sx={{ width: 130, height: 130 }}
                src={'http://localhost:3002/files/E200018_2.webp' ?? account.photoURL}
                alt="photoURL"
              />
            </IconButton>
            <input
              type="file"
              accept="image/*"
              name="avatar"
              onChange={(event) => {
                handleFileUpload(event);
              }}
              ref={fileInput}
              style={{ visibility: 'hidden' }}
            />
          </Grid>
        </Grid>
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
        <Grid container>
          {/* <Grid item xs={12} lg={5} margin={2}>
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
          </Grid> */}
          {/* <Grid item xs={12} lg={5} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="naicsCode"
              name="naicsCode"
              label="Naics Code"
              type="text"
              value={formik.values.naicsCode}
              onChange={formik.handleChange}
              error={formik.touched.naicsCode && Boolean(formik.errors.naicsCode)}
              helperText={formik.touched.naicsCode && formik.errors.naicsCode}
            />
          </Grid> */}
        </Grid>
        {/* <Grid container>
          <Grid item xs={12} lg={5} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="yelpUrl"
              name="yelpUrl"
              label="Yelp URL"
              type="text"
              value={formik.values.yelpUrl}
              onChange={formik.handleChange}
              error={formik.touched.yelpUrl && Boolean(formik.errors.yelpUrl)}
              helperText={formik.touched.yelpUrl && formik.errors.yelpUrl}
            />
          </Grid>
          <Grid item xs={12} lg={5} margin={2}>
            <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              id="g2CrowdUrl"
              name="g2CrowdUrl"
              label="G2Crowd URL"
              type="text"
              value={formik.values.g2CrowdUrl}
              onChange={formik.handleChange}
              error={formik.touched.g2CrowdUrl && Boolean(formik.errors.g2CrowdUrl)}
              helperText={formik.touched.g2CrowdUrl && formik.errors.g2CrowdUrl}
            />
          </Grid>
        </Grid> */}
        <Grid container>
          <Grid item margin={2}>
            <Button color="primary" variant="contained" fullWidth type="submit" form="profileForm">
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default ProfileForm;
