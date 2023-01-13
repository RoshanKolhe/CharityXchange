import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Button, TextField, Grid, Typography } from '@mui/material';
import axios from 'axios';
import PropTypes from 'prop-types';

const NewUser = (props) => {
  NewUser.propTypes = {
    onDataSubmit: PropTypes.func
  };
  const validationSchema = yup.object({
    username: yup.string('Enter Username').required('Username is required'),
    email: yup.string('Enter email').required('Email is required'),
    role: yup.string('Enter role').required('Role is required'),
    password: yup.string('Enter Password').required('Password is required')
  });
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      role: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      const result = await axios.post('http://localhost:3005/signup', values);
      console.log(result);
      props.onDataSubmit();
    }
  });

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        New User
      </Typography>

      <form onSubmit={formik.handleSubmit} id="userForm">
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            id="username"
            name="username"
            label="Username"
            type="text"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />
        </Grid>
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            id="role"
            name="role"
            label="Role"
            type="text"
            value={formik.values.role}
            onChange={formik.handleChange}
            error={formik.touched.role && Boolean(formik.errors.role)}
            helperText={formik.touched.role && formik.errors.role}
          />
        </Grid>
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="text"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
        </Grid>

        <Button color="primary" variant="contained" fullWidth type="submit" form="userForm">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default NewUser;
