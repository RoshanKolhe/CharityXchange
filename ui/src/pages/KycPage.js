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
  Container,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import { useLocation, useNavigate } from 'react-router-dom';
import useResponsive from '../hooks/useResponsive';
import axiosInstance from '../helpers/axios';
import ProfileForm from '../components/profile/profile-form';
import Logo from '../components/logo';

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledSection = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.background.default,
}));

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 600,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

const KycPage = () => {
  const [userProfileData, setUserProfileData] = useState({});
  const mdUp = useResponsive('up', 'md');

  useEffect(() => {
    axiosInstance.get('users/me').then((result) => {
      setUserProfileData(result.data);
    });
  }, []);

  return (
    <>
      <StyledRoot>
        <Logo
          sx={{
            position: 'fixed',
            top: { xs: 16, sm: 24, md: 40 },
            left: { xs: 16, sm: 24, md: 40 },
          }}
        />

        {mdUp && (
          <StyledSection>
            <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
              Please complete your kyc
            </Typography>
            <img src="/assets/illustrations/illustration_login.png" alt="login" />
          </StyledSection>
        )}

        <Container maxWidth="sm">
          <StyledContent>
            <Typography variant="h4" gutterBottom textAlign="center">
              KYC
            </Typography>

            <ProfileForm initialValues={userProfileData} />
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
};

export default KycPage;
