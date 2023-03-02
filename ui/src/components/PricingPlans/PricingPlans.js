import { Box, Button, Grid, Modal, TextField, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import * as yup from 'yup';
import { makeStyles } from '@mui/styles';
import { useFormik } from 'formik';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import CommonSnackBar from '../../common/CommonSnackBar';
import CustomBox from '../../common/CustomBox';
import axiosInstance from '../../helpers/axios';
import styles from './PricingPlan.module.css';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const PackageConfimationModal = ({ open, handleClose, data }) => {
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const navigate = useNavigate();

  const handlePackageSubscription = () => {
    axiosInstance
      .post(`user/subscribe`, data)
      .then((res) => {
        setErrorMessage('');
        setSuccessMessage('Package sunscription successfull');
        handleOpenSnackBar();
        navigate('/dashboard');
      })
      .catch((err) => {
        setSuccessMessage('');
        setErrorMessage(err.response.data.error.message);
        handleOpenSnackBar();
      });
    handleClose();
  };
  const classes = useStyles();
  return (
    <>
      <Modal open={open} onClose={handleClose} className={classes.modal}>
        <Modal open={open} onClose={handleClose}>
          <CustomBox>
            <div>
              <h2>Payment Confirmation</h2>
              <Grid container direction="column">
                <Grid item xs={12}>
                  <Grid container direction="row">
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#36CD71' }}>
                        Type
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        {data?.title}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container direction="row">
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#36CD71' }}>
                        Links
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        {data?.title === 'SILVER' ? '3 Links' : data?.title === 'GOLD' ? '5 Links' : '11 Links'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container direction="row">
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#36CD71' }}>
                        Amount
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        {`$${data?.discounted_price}`}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" gutterBottom>
                    Note*: Once payment is completed, it cannot be undone.
                  </Typography>
                </Grid>
              </Grid>
              <Button
                onClick={() => {
                  handlePackageSubscription();
                }}
                className={clsx(styles.pricing_button, styles.is_featured)}
              >
                Confirm Payment
              </Button>
            </div>
          </CustomBox>
        </Modal>
      </Modal>
      <CommonSnackBar
        openSnackBar={openSnackBar}
        handleCloseSnackBar={handleCloseSnackBar}
        msg={errorMessage !== '' ? errorMessage : successMessage}
        severity={errorMessage !== '' ? 'error' : 'success'}
      />
    </>
  );
};

const PricingPlan = () => {
  const [pricePlans, setPricePlans] = useState([]);
  const [userDetails, setUserDetails] = useState();
  const [open, setOpen] = useState(false);
  const [packageConfirmationData, setPackageConfirmationData] = useState();
  const navigate = useNavigate();
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const fetchPlans = () => {
    axiosInstance
      .get(`pricing-plans`)
      .then((res) => {
        setPricePlans(res.data);
      })
      .catch();
  };
  const fetchUserDetails = () => {
    axiosInstance.get('users/me').then((res) => {
      setUserDetails(res.data);
    });
  };

  useEffect(() => {
    if (userDetails?.activePayment) {
      navigate('/dashboard', { replace: true });
    }
  }, [userDetails]);
  useEffect(() => {
    fetchUserDetails();
    fetchPlans();
  }, []);

  return (
    <>
      <div className={styles.background}>
        <div className={styles.container}>
          <div className={clsx(styles.panel, styles.pricing_table)}>
            {pricePlans.length &&
              pricePlans.map((res) => (
                <div className={styles.pricing_plan}>
                  <img src={res?.features?.image} alt="" className={styles.pricing_img} />
                  <h2 className={styles.pricing_header}>{res?.title}</h2>
                  <ul className={styles.pricing_features}>
                    {res?.features?.specifications?.map((res) => (
                      <li className={styles.pricing_item}>{res}</li>
                    ))}
                  </ul>
                  <span className={styles.pricing_price}>{`$${res.price}`}</span>
                  <Button
                    className={clsx(styles.pricing_button, styles.is_featured)}
                    onClick={() => {
                      setPackageConfirmationData(res);
                      handleOpen();
                    }}
                    disabled={userDetails?.activePayment}
                  >
                    Subscribe
                  </Button>
                </div>
              ))}

            {/* <div className={styles.pricing_plan}>
              <img src="https://s28.postimg.cc/ju5bnc3x9/plane.png" alt="" className={styles.pricing_img} />
              <h2 className={styles.pricing_header}>Small team</h2>
              <ul className={styles.pricing_features}>
                <li className={styles.pricing_item}>5 Links</li>
                <li className={styles.pricing_item}>Multiple workers for more powerful apps</li>
              </ul>
              <span className={styles.pricing_price}>$150</span>
              <a href="#/" className={clsx(styles.pricing_button, styles.is_featured)}>
                Free trial
              </a>
            </div>

            <div className={styles.pricing_plan}>
              <img src="https://s21.postimg.cc/tpm0cge4n/space-ship.png" alt="" className={styles.pricing_img} />
              <h2 className={styles.pricing_header}>Enterprise</h2>
              <ul className={styles.pricing_features}>
                <li className={styles.pricing_item}>11 Links</li>
                <li className={styles.pricing_item}>Simple horizontal scalability</li>
              </ul>
              <span className={styles.pricing_price}>$400</span>
              <a href="#/" className={clsx(styles.pricing_button, styles.is_featured)}>
                Free trial
              </a>
            </div> */}
          </div>
        </div>
      </div>

      <PackageConfimationModal open={open} handleClose={handleClose} data={packageConfirmationData} />
    </>
  );
};

export default PricingPlan;
