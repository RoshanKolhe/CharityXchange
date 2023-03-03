/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Avatar, Button, Grid, IconButton, Paper, Popover, Stack, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import OrgChart from 'react-orgchart';
import { Close as CloseIcon } from '@material-ui/icons';
import 'react-orgchart/index.css';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ScrollContainer from 'react-indiana-drag-scroll';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import moment from 'moment';
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
  const [anchorEl, setAnchorEl] = useState(null);
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  return (
    <>
      <div className={clsx(classes.nodeComponentContainer)} onClick={handlePopoverOpen}>
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
                {/* <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {node.email}
                </span> */}
              </div>
            </div>
          </div>
        </Paper>
      </div>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        disablePortal
      >
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={handlePopoverClose} style={{ position: 'absolute', top: '8px', right: '8px' }}>
              <CloseIcon />
            </IconButton>
          </div>
          <Avatar
            src={node.userProfile?.avatar?.originalname ? node.userProfile?.avatar?.originalname : account.photoURL}
            style={{ margin: 'auto', marginBottom: '16px' }}
          />
          <Typography variant="body1">Name: {node.name}</Typography>
          <Typography variant="body1">Email: {node.email}</Typography>
          <Typography variant="body1">
            Joining Date: {`${moment(new Date(node?.createdAt)).format('YYYY-MM-DD HH:mm:ss')}`}
          </Typography>
          <Typography variant="body1">Direct: {node?.children?.length || 0}</Typography>
          <Typography variant="body1">
            Total Earning:{' '}
            {typeof node?.balance_user === 'string'
              ? JSON.parse(node?.balance_user).total_earnings
              : node?.balance_user?.total_earnings || 0}
          </Typography>
        </div>
      </Popover>
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
