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
} from '@mui/material';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import axiosInstance from '../helpers/axios';
import ProfileForm from '../components/profile/profile-form';

const ProfilePage = () => {
  const [userProfileData, setUserProfileData] = useState({});

  useEffect(() => {
    axiosInstance.get('users/me').then((result) => {
      setUserProfileData(result.data);
    });
  }, []);

  return (
    <>
      <ProfileForm initialValues={userProfileData} />
    </>
  );
};

export default ProfilePage;
