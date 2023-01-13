import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Button, TextField, Grid, Typography } from '@mui/material';
import axios from 'axios';
import PropTypes from 'prop-types';

const NewCompany = (props) => {
  NewCompany.propTypes = {
    onDataSubmit: PropTypes.func
  };
  const validationSchema = yup.object({
    name: yup.string('Enter name').required('name is required'),
    domain: yup.string('Enter your domain').required('domain is required'),
    websiteUrl: yup.string('Enter Website URL').required('Website URL is required'),
    naicsCode: yup.string('Enter NaicsCode').required('NaicsCode is required'),
    yelpUrl: yup.string('Enter Yelp URL').required('Yelp URL is required'),
    g2CrowdUrl: yup.string('Enter G2Crowd URL').required(' G2Crowd URL is required'),
    tags: yup.string('Enter Tags').required('Tags is required')
  });
  const formik = useFormik({
    initialValues: {
      name: 'Weoto',
      domain: 'weoto.in',
      websiteUrl: 'weoto.in',
      naicsCode: '123456',
      yelpUrl: 'weoto.in/yelp',
      g2CrowdUrl: 'weoto.in/g2c',
      tags: 'IT company'
    },
    validationSchema,
    onSubmit: async (values) => {
      const result = await axios.post('http://localhost:3005/companies', values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log(result);
      props.onDataSubmit();
    }
  });

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        New Company
      </Typography>

      <form onSubmit={formik.handleSubmit} id="companyForm">
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
            id="domain"
            name="domain"
            label="Domain"
            type="text"
            value={formik.values.domain}
            onChange={formik.handleChange}
            error={formik.touched.domain && Boolean(formik.errors.domain)}
            helperText={formik.touched.domain && formik.errors.domain}
          />
        </Grid>
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            id="websiteUrl"
            name="websiteUrl"
            label="Web URL"
            type="text"
            value={formik.values.websiteUrl}
            onChange={formik.handleChange}
            error={formik.touched.websiteUrl && Boolean(formik.errors.websiteUrl)}
            helperText={formik.touched.websiteUrl && formik.errors.websiteUrl}
          />
        </Grid>
        <Grid item xs={12} margin={2}>
          <TextField
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
        </Grid>

        <Grid item xs={12} margin={2}>
          <TextField
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
        <Grid item xs={12} margin={2}>
          <TextField
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
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            id="tags"
            name="tags"
            label="Tags"
            type="text"
            value={formik.values.tags}
            onChange={formik.handleChange}
            error={formik.touched.tags && Boolean(formik.errors.tags)}
            helperText={formik.touched.tags && formik.errors.tags}
          />
        </Grid>
        <Button color="primary" variant="contained" fullWidth type="submit" form="companyForm">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default NewCompany;
