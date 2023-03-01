/* eslint-disable consistent-return */
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import SaveIcon from '@mui/icons-material/Save';
import {
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Tooltip,
  IconButton,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import closefill from '@iconify/icons-eva/close-fill';
import { LoadingButton } from '@mui/lab';
import axiosInstance from '../helpers/axios';
import CommonSnackBar from './CommonSnackBar';

const TextFieldPopup = (props) => {
  TextFieldPopup.propTypes = {
    onDataSubmit: PropTypes.func,
    handleClose: PropTypes.func,
    title: PropTypes.string,
    textFieldType: PropTypes.string,
    textFieldLabel: PropTypes.string,
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = yup.object({
    name: yup.string('Enter data').required('Required'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      props.onDataSubmit(values.name);
      setIsSubmitting(false);
    },
  });
  const { errors, touched, handleSubmit, getFieldProps } = formik;

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
          {props.title}
        </Typography>
        <Tooltip password="Close">
          <IconButton onClick={props.handleClose}>
            <Icon icon={closefill} />
          </IconButton>
        </Tooltip>
      </Box>

      <form onSubmit={formik.handleSubmit} id="textFieldSubmitForm">
        <Grid item xs={12} margin={2}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label={props.textFieldLabel}
            type={props.textFieldType}
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>

        <LoadingButton
          loading={isSubmitting}
          loadingPosition="start"
          variant="contained"
          startIcon={<SaveIcon />}
          color="primary"
          fullWidth
          type="submit"
          form="textFieldSubmitForm"
          disabled={isSubmitting}
        >
          Submit
        </LoadingButton>
      </form>
    </div>
  );
};

export default TextFieldPopup;
