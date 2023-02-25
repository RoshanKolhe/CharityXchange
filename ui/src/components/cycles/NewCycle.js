/* eslint-disable consistent-return */
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
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
import moment from 'moment';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Icon } from '@iconify/react';
import closefill from '@iconify/icons-eva/close-fill';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import axiosInstance from '../../helpers/axios';
import CommonSnackBar from '../../common/CommonSnackBar';

const NewCycle = (props) => {
  NewCycle.propTypes = {
    onDataSubmit: PropTypes.func,
    handleClose: PropTypes.func,
    cyclesData: PropTypes.array,
  };

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highestDate, setHighestDate] = useState();
  const validationSchema = yup.object({
    startDate: yup.string('Select Start Date').required('Start Date is required'),
    endDate: yup
      .date()
      .when('startDate', (startDate, schema) => startDate && schema.min(startDate))
      .required('End Date is required'),
  });

  const [currentUser, setCurrentUser] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackBar, setOpenSnackBar] = useState(false);

  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const formik = useFormik({
    initialValues: {
      startDate: '',
      endDate: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      const inputValues = {
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
        is_active: true,
      };
      axiosInstance
        .post('cycles', inputValues)
        .then((res) => {
          setIsSubmitting(false);
          props.onDataSubmit();
        })
        .catch((err) => {
          setIsSubmitting(false);
          setErrorMessage(err.response.data.error.message);
          handleOpenSnackBar();
        });
    },
  });

  const sortData = (cycleData) => {
    cycleData = cycleData.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
    setHighestDate(cycleData[0].endDate);
  };

  const onKeyDown = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (props.cyclesData) sortData(props.cyclesData);
  }, [props.cyclesData]);

  useEffect(() => {
    axiosInstance.get('users/me').then((res) => {
      setCurrentUser(res.data);
    });
  }, []);

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
          New Cycle
        </Typography>
        <Tooltip password="Close">
          <IconButton onClick={props.handleClose}>
            <Icon icon={closefill} />
          </IconButton>
        </Tooltip>
      </Box>

      <form onSubmit={formik.handleSubmit} id="cycleForm">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid item xs={12} margin={2}>
            <DateTimePicker
              label="Start Date"
              minDate={highestDate}
              value={formik.values.startDate || null}
              onChange={(newValue) => formik.setFieldValue('startDate', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  autoComplete="off"
                  error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                  helperText={formik.touched.startDate && formik.errors.startDate}
                  onKeyDown={onKeyDown}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} margin={2}>
            <DateTimePicker
              label="End Date"
              minDate={highestDate}
              value={formik.values.endDate || null}
              onChange={(newValue) => formik.setFieldValue('endDate', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoComplete="off"
                  fullWidth
                  error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                  helperText={formik.touched.endDate && formik.errors.endDate}
                  onKeyDown={onKeyDown}
                />
              )}
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
            form="cycleForm"
            disabled={isSubmitting}
          >
            Submit
          </LoadingButton>
        </LocalizationProvider>
      </form>
      <CommonSnackBar
        openSnackBar={openSnackBar}
        handleCloseSnackBar={handleCloseSnackBar}
        msg={errorMessage}
        severity="error"
      />
    </div>
  );
};

export default NewCycle;
