/* eslint-disable camelcase */
import { Helmet } from 'react-helmet-async';
import { filter, omit } from 'lodash';
import { useEffect, useState } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';

// @mui
import {
  Card,
  Table,
  TextField,
  Stack,
  Tooltip,
  Button,
  Autocomplete,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Link,
  Typography,
  TableContainer,
  TablePagination,
  Container,
  Modal,
  Box,
  Snackbar,
  Alert,
  Popover,
  MenuItem,
  Avatar,
  IconButton,
  Paper,
  Grid,
} from '@mui/material';
// components
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import moment from 'moment';
import { AppWidgetSummary } from '../../sections/@dashboard/app';
import Label from '../label';
import Iconify from '../iconify';
import Scrollbar from '../scrollbar';
// sections
// mock
import axiosInstance from '../../helpers/axios';
import CommonSnackBar from '../../common/CommonSnackBar';
import { ListHead, ListToolbar } from '../../sections/@dashboard/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'linkName', label: 'Link', alignRight: false },
  { id: 'is_active', label: 'Active', alignRight: false },
  { id: 'is_help_send', label: 'Help Send', alignRight: false },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.linkName.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

const useStyles = makeStyles((theme) => ({
  textContainer: {
    display: 'block',
    width: '250px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowColor: {
    background: '#DFDFDF',
  },

  pointerCss: {
    cursor: 'pointer',
  },
}));

export default function ViewCycleDetails() {
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #fff',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
  };
  const classes = useStyles();

  const navigate = useNavigate();
  const params = useParams();
  const [open, setOpen] = useState(null);
  const [timer, setTimer] = useState(null);
  const [checkEndCycle, setCheckEndCycle] = useState(false);

  const [cycleIncomeData, setCycleIncomeData] = useState([]);

  const [currentCycleData, setCurrentCycleData] = useState();

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [editUserData, setEditUserData] = useState({});

  const [orderBy, setOrderBy] = useState('id');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [msg, setMsg] = useState('');
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const handleNavigate = (url) => {
    navigate(url);
  };

  const handleOpenMenu = (event, row) => {
    setOpen(event.currentTarget);
    setEditUserData(row);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);

    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    console.log('event', event);
    setPage(0);
    setFilterName(event.target.value);
  };

  const fetchData = () => {
    axiosInstance
      .post(`/cycles/getCycleData`, currentCycleData)
      .then((res) => {
        setCycleIncomeData(res.data);
      })
      .catch((err) => {
        setCycleIncomeData([]);
      });
  };

  const getCurrentCycleData = () => {
    axiosInstance
      .get(`/cycles/${params.id}`)
      .then((res) => {
        setCurrentCycleData(res.data);
      })
      .catch((err) => {
        setErrorMessage(err.response.data.error.message);
        setSuccessMessage('');
        handleOpenSnackBar();
        fetchData();
      });
  };

  const handleEndCycle = () => {
    axiosInstance
      .post(`/cycles/endCycle`, currentCycleData)
      .then((res) => {
        setErrorMessage('');
        setSuccessMessage('Cycle Ended Successfully');
        handleOpenSnackBar();
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      })
      .catch((err) => {
        setErrorMessage(err.response.data.error.message);
        setSuccessMessage('');
        handleOpenSnackBar();
        fetchData();
      });
  };

  useEffect(() => {
    getCurrentCycleData();
  }, []);

  useEffect(() => {
    if (currentCycleData) {
      const endDate = new Date(currentCycleData.endDate);
      if (endDate <= new Date()) {
        setCheckEndCycle(true);
      }
      fetchData();
    }
  }, [currentCycleData]);

  return (
    <>
      <Helmet>
        <title> Links | CharityXchange </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Links
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-evenly" mb={2}>
          <Typography variant="body1" gutterBottom>
            {`Start Date : ${moment(new Date(currentCycleData?.startDate)).format('YYYY-MM-DD HH:mm:ss')}`}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {`End Date : ${moment(new Date(currentCycleData?.endDate)).format('YYYY-MM-DD HH:mm:ss')}`}
          </Typography>
          <Button variant="contained" color="error" onClick={handleEndCycle} disabled={checkEndCycle}>
            End Cycle
          </Button>
        </Stack>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <AppWidgetSummary
              title="Total LevelIncome "
              total={`${cycleIncomeData?.levelIncome}`}
              icon={'ic:twotone-attach-money'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <AppWidgetSummary
              title="Total Award Or Rewards"
              total={`${cycleIncomeData?.awardOrReward}`}
              color="info"
              icon={'ic:twotone-attach-money'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <AppWidgetSummary
              title="Total"
              total={cycleIncomeData?.levelIncome + cycleIncomeData?.awardOrReward}
              color="info"
              icon={'mdi:loyalty'}
            />
          </Grid>

          {/* <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Withdrawn Balance" total={20} color="warning" icon={'bx:money-withdraw'} />
          </Grid> */}
        </Grid>
      </Container>
      <CommonSnackBar
        openSnackBar={openSnackBar}
        handleCloseSnackBar={handleCloseSnackBar}
        msg={errorMessage !== '' ? errorMessage : successMessage}
        severity={errorMessage !== '' ? 'error' : 'success'}
      />
    </>
  );
}
