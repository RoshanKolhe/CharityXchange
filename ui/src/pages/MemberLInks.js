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
import clsx from 'clsx';
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
  { id: 'linkName', label: 'Link', alignRight: false },
  { id: 'is_active', label: 'Active', alignRight: false },
  { id: 'is_help_send', label: 'Send Help', alignRight: false },
  { id: 'is_help_received', label: 'Help Received', alignRight: false },
  { id: 'activationStartTime', label: 'Time Remaining', alignRight: false },
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
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
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

export default function MemberLinks() {
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

  const [tokenRequests, setTokenRequests] = useState([]);

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
    if (event.target.checked) {
      const newSelecteds = tokenRequests.map((n) => n.id);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tokenRequests.length) : 0;

  const filteredUsers = applySortFilter(tokenRequests, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length;
  const clearAllInterval = () => {
    const interval_id = window.setInterval(() => {}, Number.MAX_SAFE_INTEGER);

    // Clear any timeout/interval up to that id
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i < interval_id; i++) {
      window.clearInterval(i);
    }
  };

  const fetchData = () => {
    clearAllInterval();
    axiosInstance
      .get(`/users/user-links?filter[order]=linkName%20DESC`)
      .then((res) => {
        setTokenRequests(res.data);
      })
      .catch((err) => {
        setTokenRequests([]);
      });
  };

  const handleLinkActivate = (row) => {
    let inputData = {
      ...row,
      activationStartTime: `${new Date()}`,
      activationEndTime: `${AddMinutesToDate(new Date(), 1440)}`,
    };
    inputData = omit(inputData, 'userId');
    axiosInstance
      .patch(`/users/update-user-link?where[id]=${row.id}`, inputData)
      .then((res) => {
        setErrorMessage('');
        setSuccessMessage('Successfully Activated Link');
        handleOpenSnackBar();
        fetchData();
      })
      .catch((err) => {
        setErrorMessage(err.response.data.error.message);
        setSuccessMessage('');
        handleOpenSnackBar();
        fetchData();
      });
  };

  const handleSendHelp = (row) => {
    let inputData = {
      ...row,
      is_active: true,
      is_help_send: true,
      is_help_received: false,
      is_send_to_admin: false,
    };
    inputData = omit(inputData, 'userId');
    axiosInstance
      .patch(`/users/update-user-help-link?where[id]=${row.id}`, inputData)
      .then((res) => {
        setErrorMessage('');
        setSuccessMessage('Successfully Activated Link');
        handleOpenSnackBar();
        fetchData();
      })
      .catch((err) => {
        setErrorMessage(
          Object.keys(err.response.data.error.message).length > 0
            ? err.response.data.error.message.message
            : err.response.data.error.message
        );
        setSuccessMessage('');
        handleOpenSnackBar();
        fetchData();
      });
  };

  const AddMinutesToDate = (date, minutes) => new Date(date.getTime() + minutes * 60000);

  const renderCountdown = (dateStart, dateEnd) => {
    const targetDate = new Date(dateEnd).getTime(); // set the countdown date
    const count = 0;
    const getCountdown = function () {
      // find the amount of "seconds" between now and target
      const currentDate = new Date().getTime();
      let secondsLeft = (targetDate - currentDate) / 1000 - count;
      const days = Math.floor(secondsLeft / 86400);
      secondsLeft %= 86400;
      const hours = Math.floor(secondsLeft / 3600);
      secondsLeft %= 3600;
      const minutes = Math.floor(secondsLeft / 60);
      const seconds = Math.floor(secondsLeft % 60);
      // format countdown string + set tag value
      return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };
    function pad(n) {
      return (n < 10 ? '0' : '') + n;
    }
    return getCountdown();
  };

  const checkActiveState = (row) => {
    const now = new Date();
    let expire_start_date;
    let expire_end_date;
    if (row.activationStartTime && row.activationEndTime) {
      expire_start_date = new Date(row.activationStartTime);
      expire_end_date = new Date(row.activationEndTime);
    }
    if (row.is_active) {
      return true;
    }
    if (!row.is_active && expire_start_date && expire_end_date && now <= expire_end_date && now >= expire_start_date) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <Typography variant="caption" gutterBottom>
          Note*: Activating a link will result in a $10 deduction from your wallet, and sending help will result in a
          $20 deduction. After activating the link, help must be sent within 24 hours or the link will deactivate and
          need to be reactivated.
        </Typography>
        <Card>
          {/* <ListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} /> */}

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ListHead
                  order={order}
                  isCheckbox={false}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tokenRequests.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const {
                      id,
                      linkName,
                      is_active,
                      is_help_send,
                      is_send_to_admin,
                      is_help_received,
                      activationStartTime,
                      activationEndTime,
                    } = row;
                    const selectedUser = selected.indexOf(id) !== -1;
                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={selectedUser}
                        className={clsx(is_send_to_admin ? classes.rowColor : null)}
                      >
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, id)} />
                        </TableCell> */}

                        <TableCell align="left">
                          <Typography variant="subtitle2" noWrap>
                            {linkName}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Label
                            color={!checkActiveState(row) ? 'error' : checkActiveState(row) ? 'success' : 'error'}
                            className={clsx(!checkActiveState(row) ? classes.pointerCss : null)}
                            onClick={() => {
                              if (!checkActiveState(row)) {
                                handleLinkActivate(row);
                              }
                            }}
                          >
                            {checkActiveState(row) ? 'Active' : 'Activate'}
                          </Label>
                        </TableCell>
                        <TableCell align="left">
                          <Label
                            className={clsx(!is_help_send ? classes.pointerCss : null)}
                            color={!is_help_send ? 'error' : is_help_send ? 'success' : 'error'}
                            onClick={() => {
                              if (
                                new Date() <= new Date(activationEndTime) &&
                                new Date() >= new Date(activationStartTime)
                              ) {
                                handleSendHelp(row);
                              }
                            }}
                          >
                            {!is_help_send ? 'Send Help' : is_help_send ? 'Active' : 'Send Help'}
                          </Label>
                        </TableCell>
                        <TableCell align="left">
                          <Label color={!is_help_received ? 'error' : is_help_received ? 'success' : 'error'}>
                            {!is_help_received ? 'Pending' : is_help_received ? 'Received' : 'Pending'}
                          </Label>
                        </TableCell>
                        <TableCell align="left" id={`countdown-${row.id}`}>
                          <Typography variant="subtitle2" noWrap>
                            {!is_active &&
                            activationStartTime &&
                            activationEndTime &&
                            new Date() <= new Date(activationEndTime) &&
                            new Date() >= new Date(activationStartTime)
                              ? setInterval(() => {
                                  const countdown = renderCountdown(new Date(), activationEndTime);
                                  const timeCell = document.getElementById(`countdown-${row.id}`);
                                  if (timeCell) timeCell.textContent = countdown;
                                }, 1000)
                              : ''}
                          </Typography>
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
    </>
  );
}
