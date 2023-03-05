import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import { Container, Typography } from '@mui/material';
// hooks
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useResponsive from '../hooks/useResponsive';
// components
import Logo from '../components/logo';
// sections
import { LoginForm } from '../sections/auth/login';
import ChangePasswordForm from '../sections/auth/login/ChangePasswordForm';

// ----------------------------------------------------------------------

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
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function ChangePasswordPage() {
  const mdUp = useResponsive('up', 'md');
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const isKycCompleted = localStorage.getItem('is_kyc_completed');
  const permissions = localStorage.getItem('permissions');

  useEffect(() => {
    if (permissions && permissions.split(',').includes('super_admin')) {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (isAuthenticated && isKycCompleted === '2') {
      const { from } = location.state || { from: { pathname: '/dashboard' } };
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, location, navigate]);


  return (
    <>
      <Helmet>
        <title> Change Password | CharityXchange </title>
      </Helmet>

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
              Hi, Welcome Back
            </Typography>
            <img src="/assets/illustrations/illustration_login.png" alt="login" />
          </StyledSection>
        )}

        <Container maxWidth="sm">
          <StyledContent>
            <Typography variant="h4" gutterBottom textAlign="center">
              Change Password
            </Typography>

            <ChangePasswordForm  />
            {/* <Typography variant="body2" sx={{ mb: 5, display: 'flex', justifyContent: 'center' }}>
              Forgot Password?
              <Link variant="subtitle2">Get started</Link>
            </Typography> */}
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
