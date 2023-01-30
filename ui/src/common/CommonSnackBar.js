import { Snackbar, Alert } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';

export default function CommonSnackBar(props) {
  CommonSnackBar.propTypes = {
    openSnackBar: PropTypes.bool,
    handleCloseSnackBar: PropTypes.func,
    msg: PropTypes.string,
    severity: PropTypes.string
    // timestampInfoIcon: PropTypes.string
  };

  const { openSnackBar, handleCloseSnackBar, msg, severity } = props;

  return (
    <div>
      {' '}
      <Snackbar
        open={openSnackBar}
        autoHideDuration={5000}
        onClose={handleCloseSnackBar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackBar} severity={severity} sx={{ width: '100%' }}>
          {msg}
        </Alert>
      </Snackbar>
    </div>
  );
}
