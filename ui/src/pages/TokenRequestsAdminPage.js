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
} from '@mui/material';
// components
import { makeStyles } from '@mui/styles';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
// mock
import axiosInstance from '../helpers/axios';
import CommonSnackBar from '../common/CommonSnackBar';
import { ListHead, ListToolbar } from '../sections/@dashboard/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Id', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
  { id: 'transaction_id', label: 'Transaction Id', alignRight: false },
  { id: 'payment_screen_shot', label: 'Transaction Proof', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
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
    return filter(array, (_user) => _user.amount.toString().toLowerCase().indexOf(query.toLowerCase()) !== -1);
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
}));

export default function TokenRequestsAdminPage() {
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
  const [open, setOpen] = useState(null);

  const [tokenRequests, setTokenRequests] = useState([]);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [editUserData, setEditUserData] = useState({});

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [msg, setMsg] = useState('');
  const [openSnackBar, setOpenSnackBar] = useState(false);

  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const handleNavigate = (url) => {
    navigate(url, { replace: true });
  };

  const handleOpenMenu = (event, row) => {
    setOpen(event.currentTarget);
    setEditUserData(row);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    console.log(event.target);
    if (event.target.checked) {
      const newSelecteds = tokenRequests.filter((e) => e.status === 0).map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
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
    setPage(0);
    setFilterName(event.target.value);
  };

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleApproveClick = (userData) => {
    console.log('userData', userData);
    userData = omit(userData, 'user');
    const inputData = {
      ...userData,
      status: 1,
    };

    axiosInstance
      .patch(`/token-requests/${userData.id}`, inputData)
      .then((res) => {
        handleOpenSnackBar();
        setErrorMessage('');
        setSuccessMessage('Token Request Approved Successfully');
        handleCloseMenu();
        fetchData();
      })
      .catch((err) => {
        handleOpenSnackBar();
        setErrorMessage(err.response.data.error.message);
        handleOpenSnackBar();
      });
  };

  const handleDeclineClick = (userData) => {
    const inputData = {
      status: 2,
    };
    axiosInstance
      .patch(`/token-requests/${userData.id}`, inputData)
      .then((res) => {
        handleOpenSnackBar();
        setErrorMessage('');
        setSuccessMessage('Token Request Declined Successfully');
        handleCloseMenu();
        fetchData();
      })
      .catch((err) => {
        handleOpenSnackBar();
        setErrorMessage(err.response.data.error.message);
        handleOpenSnackBar();
      });
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tokenRequests.length) : 0;

  const filteredUsers = applySortFilter(tokenRequests, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length;

  const fetchData = () => {
    axiosInstance
      .get(`token-requests?filter[include][]=user&filter[order]=createdAt%20DESC`)
      .then((res) => {
        setTokenRequests(res.data);
      })
      .catch((err) => {
        setTokenRequests([]);
      });
  };

  const handleReloadData = (event) => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title> Token Requests | CharityXchange </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Token Requests
          </Typography>
        </Stack>

        <Card>
          <ListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            onReload={handleReloadData}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ListHead
                  isCheckbox
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tokenRequests.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, amount, transaction_id, payment_screen_shot, status, userId } = row;
                    const selectedUser = selected.indexOf(id) !== -1;
                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          {status === 0 && (
                            <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, id)} />
                          )}
                        </TableCell>
                        <TableCell align="left">
                          <Typography variant="subtitle2" noWrap>
                            {userId}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography variant="subtitle2" noWrap>
                            {`${amount}`}
                          </Typography>
                        </TableCell>
                        <Tooltip placement="top" title={transaction_id}>
                          <TableCell
                            align="left"
                            className={classes.textContainer}
                            onClick={() => {
                              navigator.clipboard.writeText(transaction_id);
                              setMsg('Copied');
                              handleOpenSnackBar();
                            }}
                          >
                            {transaction_id}
                          </TableCell>
                        </Tooltip>
                        <TableCell align="left">
                          <Label
                            color="secondary"
                            onClick={() => window.open(payment_screen_shot?.originalname, '_blank')}
                            style={{ cursor: 'pointer' }}
                          >
                            View
                          </Label>
                        </TableCell>

                        <TableCell align="left">
                          <Label color={status === 0 ? 'error' : status === 1 ? 'success' : 'error'}>
                            {status === 0 ? 'Processing' : status === 1 ? 'Approved' : 'Declined'}
                          </Label>
                        </TableCell>
                        <TableCell align="right">
                          {status === 0 && (
                            <IconButton
                              size="large"
                              color="inherit"
                              onClick={(event) => {
                                handleOpenMenu(event, row);
                              }}
                            >
                              <Iconify icon={'eva:more-vertical-fill'} />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={tokenRequests.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
      <CommonSnackBar
        openSnackBar={openSnackBar}
        handleCloseSnackBar={handleCloseSnackBar}
        msg={errorMessage !== '' ? errorMessage : successMessage}
        severity={errorMessage !== '' ? 'error' : 'success'}
      />
      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
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
        <MenuItem
          sx={{ color: 'seagreen' }}
          onClick={() => {
            handleApproveClick(editUserData);
          }}
        >
          <Iconify icon={'mdi:tick'} sx={{ mr: 2 }} />
          Approve
        </MenuItem>
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            handleDeclineClick(editUserData);
          }}
        >
          <Iconify icon={'system-uicons:cross'} sx={{ mr: 2 }} />
          Decline
        </MenuItem>
      </Popover>
    </>
  );
}
