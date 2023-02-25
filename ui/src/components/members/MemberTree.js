/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Avatar, Button, Grid, Paper, Popover, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import OrgChart from 'react-orgchart';
import 'react-orgchart/index.css';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ScrollContainer from 'react-indiana-drag-scroll';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import CustomBox from '../../common/CustomBox';
import account from '../../_mock/account';
import './MemberTree.css';

function traverse(obj) {
  const o = { ...obj };
  // eslint-disable-next-line no-restricted-syntax
  for (const i in o) {
    if (!!o[i] && typeof o[i] === 'object') {
      traverse(o[i]);
    } else if (i === 'id' && o[i] === 4) {
      console.log(i, o[i]);
    }
  }
}

const useStyles = makeStyles((theme) => ({
  nodeComponentContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    cursor: 'pointer',
  },
  nodeComponentContainerBackground: {
    backgroundColor: '#DFDFDF',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const MyNodeComponent = ({ node }) => {
  const classes = useStyles();

  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };
  return (
    <>
      <div className={clsx(classes.nodeComponentContainer)}>
        <Paper style={{ marginRight: 10, marginLeft: 10, width: '100%', maxWidth: 400, minHeight: 80 }} elevation={5}>
          <div style={{ display: 'flex', minHeight: 80 }}>
            <div
              style={{
                width: 8,
                minWidth: 8,
                background: '#00ab55',
                borderRadius: '5px 0px 0px 5px',
              }}
            />
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', marginLeft: 10 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  alt={node.name}
                  src={
                    node.userProfile?.avatar?.originalname ? node.userProfile?.avatar?.originalname : account.photoURL
                  }
                />
              </Stack>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  alignItems: 'start',
                  marginLeft: 10,
                  marginRight: 10,
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {node.name}
                </span>
                <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {node.email}
                </span>
              </div>
            </div>
          </div>
        </Paper>
      </div>
      {/* <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
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
                    {node?.title}
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
                    {node?.title === 'SILVER' ? '3 Links' : node?.title === 'GOLD' ? '5 Links' : '11 Links'}
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
                    {`${node?.discounted_price}`}
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
        </div>
      </Popover> */}
    </>
  );
};

function MemberTree({ treeData }) {
  traverse(treeData);

  return (
    <ScrollContainer className="scroll-container">
      <div id="initechOrgChart">
        <OrgChart tree={treeData} NodeComponent={MyNodeComponent} />
      </div>
    </ScrollContainer>
  );
}

export default MemberTree;
