import { Box, Button, Grid, Modal, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import * as yup from 'yup';
import { makeStyles } from '@mui/styles';
import { useFormik } from 'formik';
import clsx from 'clsx';
import CommonSnackBar from '../../common/CommonSnackBar';
import axiosInstance from '../../helpers/axios';
import styles from './PricingPlan.module.css';

const PricingPlan = () => (
  <>
    <div className={styles.background}>
      <div className={styles.container}>
        <div className={clsx(styles.panel, styles.pricing_table)}>
          <div className={styles.pricing_plan}>
            <img src="https://s22.postimg.cc/8mv5gn7w1/paper-plane.png" alt="" className={styles.pricing_img} />
            <h2 className={styles.pricing_header}>Personal</h2>
            <ul className={styles.pricing_features}>
              <li className={styles.pricing_item}>3 Links</li>
              <li className={styles.pricing_item}>Sleeps after 30 mins of inactivity</li>
            </ul>
            <span className={styles.pricing_price}>$300</span>
            <a href="#/" className={styles.pricing_button}>
              Sign up
            </a>
          </div>

          <div className={styles.pricing_plan}>
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
          </div>
        </div>
      </div>
    </div>
  </>
);

export default PricingPlan;
