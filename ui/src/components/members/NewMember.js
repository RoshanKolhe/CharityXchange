/* eslint-disable consistent-return */
import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Button, TextField, Grid, Typography, Box, Tooltip, IconButton, Autocomplete } from '@mui/material';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import closefill from '@iconify/icons-eva/close-fill';
import axiosInstance from '../../helpers/axios';

const NewMember = (props) => {
  NewMember.propTypes = {
    onDataSubmit: PropTypes.func,
    handleClose: PropTypes.func,
  };

  const validationSchema = yup.object({
    alertType: yup
      .string('Enter alertType')
      .required('alertType is required')
      .test('len', 'Must be less than 20 characters', (val) => {
        if (val) return val.toString().length < 20;
      }),
    title: yup
      .string('Enter title')
      .required('title is required')
      .test('len', 'Must be less than 50 characters', (val) => {
        if (val) return val.toString().length < 50;
      }),
    description: yup
      .string('Enter description')
      .required(' description  is required')
      .test('len', 'Must be less than 50 characters', (val) => {
        if (val) return val.toString().length < 50;
      }),
  });
  const formik = useFormik({
    initialValues: {
      alertType: '',
      title: '',
      description: '',
      source: '',
      qualityCheck: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log(values);
    },
  });

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
          New Alert
        </Typography>
        <Tooltip title="Close">
          <IconButton onClick={props.handleClose}>
            <Icon icon={closefill} />
          </IconButton>
        </Tooltip>
      </Box>

      <form onSubmit={formik.handleSubmit} id="alertForm">
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            id="alertType"
            name="alertType"
            label="Type"
            type="text"
            value={formik.values.alertType}
            onChange={formik.handleChange}
            error={formik.touched.alertType && Boolean(formik.errors.alertType)}
            helperText={formik.touched.alertType && formik.errors.alertType}
          />
        </Grid>
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            id="title"
            name="title"
            label="Title"
            type="text"
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
          />
        </Grid>
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            type="text"
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
        </Grid>
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            id="source"
            name="source"
            label="Source"
            type="text"
            value={formik.values.source}
            onChange={formik.handleChange}
            error={formik.touched.source && Boolean(formik.errors.source)}
            helperText={formik.touched.source && formik.errors.source}
          />
        </Grid>
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            id="qualityCheck"
            name="qualityCheck"
            label="Quality Check"
            type="text"
            value={formik.values.qualityCheck}
            onChange={formik.handleChange}
            error={formik.touched.qualityCheck && Boolean(formik.errors.qualityCheck)}
            helperText={formik.touched.qualityCheck && formik.errors.qualityCheck}
          />
        </Grid>

        <Button color="primary" variant="contained" fullWidth type="submit" form="alertForm">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default NewMember;
