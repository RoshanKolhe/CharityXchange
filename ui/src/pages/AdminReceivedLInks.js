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
import LoadingScreen from '../common/LoadingScreen';
import CustomBox from '../common/CustomBox';
import TextFieldPopup from '../common/TextFieldPopup';
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
  { id: 'userName', label: 'User Name', alignRight: false },
  { id: 'email', label: 'Email', alignRight: false },
  { id: 'is_active', label: 'Active', alignRight: false },
  { id: 'is_help_send', label: 'Help Send', alignRight: false },
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

export default function AdminReceivedLInks() {
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
  const [openModal, setOpenMdal] = useState(false);

  const [openAproveAllModal, setOpenAproveAllModal] = useState(false);

  const [helpToSendMember, setHelpToSendMember] = useState(0.0);

  const handleOpen = () => setOpenMdal(true);
  const handleClose = () => setOpenMdal(false);

  const handleAllOpen = () => setOpenAproveAllModal(true);
  const handleAllClose = () => setOpenAproveAllModal(false);

  const [tokenRequests, setTokenRequests] = useState([]);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [editUserData, setEditUserData] = useState({});

  const [orderBy, setOrderBy] = useState('id');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
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
    console.log('event', event);
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tokenRequests.length) : 0;

  const filteredUsers = applySortFilter(tokenRequests, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length;

  const fetchData = (startDate, endDate) => {
    setLoading(true);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    let filterString = `/user-links/admin-received-links?filter[where][createdAt][lt]=${sevenDaysAgo}&filter[where][is_help_send_to_user]=false`;
    if (startDate && endDate) {
      filterString = `/user-links/admin-received-links?filter[where][is_help_send_to_user]=false&filter[where][createdAt][between][0]=${startDate}&filter[where][createdAt][between][1]=${endDate}&filter[where][createdAt][lt]=${sevenDaysAgo}`;
    }
    axiosInstance
      .get(filterString)
      .then((res) => {
        setLoading(false);
        setTokenRequests(res.data);
      })
      .catch((err) => {
        setLoading(false);
        setTokenRequests([]);
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

  const handleApproveLinkHelpSend = (perLinkPayment) => {
    if (parseFloat(perLinkPayment) < 0) {
      setErrorMessage('Per Link Amount should not be less than 0');
      handleOpenSnackBar();
      return;
    }
    setLoading(true);
    const inputData = {
      linkIds: [editUserData.id],
      perLinkPayment: parseFloat(perLinkPayment),
    };

    axiosInstance
      .patch(`sendHelpToLink`, inputData)
      .then((res) => {
        setLoading(false);
        setErrorMessage('');
        setSuccessMessage('Help sent Successfully');
        handleOpenSnackBar();
        handleCloseMenu();
        fetchData();
      })
      .catch((err) => {
        setLoading(false);
        setErrorMessage(err.response.data.error.message);
        setSuccessMessage('');
        handleOpenSnackBar();
        handleCloseMenu();
        fetchData();
      });
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

  const onApproveSelected = (perLinkPayment) => {
    if (parseFloat(perLinkPayment) < 0) {
      setErrorMessage('Per Link Amount should not be less than 0');
      handleOpenSnackBar();
      return;
    }
    setLoading(true);
    const inputData = {
      linkIds: selected,
      perLinkPayment: parseFloat(perLinkPayment),
    };
    axiosInstance
      .patch(`sendHelpToLink`, inputData)
      .then((res) => {
        setLoading(false);
        setErrorMessage('');
        setSuccessMessage('Help sent Successfully');
        handleOpenSnackBar();
        handleCloseMenu();
        fetchData();
        setSelected([]);
      })
      .catch((err) => {
        setLoading(false);
        setErrorMessage(err.response.data.error.message);
        setSuccessMessage('');
        handleOpenSnackBar();
        handleCloseMenu();
        fetchData();
        setSelected([]);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      {loading ? <LoadingScreen /> : null}
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
          <ListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            onReload={fetchData}
            onApproveSelected={handleAllOpen}
            isFilter
            onFilterDateSelected={fetchData}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ListHead
                  order={order}
                  isCheckbox
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
                      userLinks,
                      is_send_to_admin,
                      is_help_received,
                      activationStartTime,
                      activationEndTime,
                    } = row;
                    const selectedUser = selected.indexOf(id) !== -1;
                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, id)} />
                        </TableCell>

                        <TableCell align="left">
                          <Typography variant="subtitle2" noWrap>
                            {linkName}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography variant="subtitle2" noWrap>
                            {userLinks?.user?.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography variant="subtitle2" noWrap>
                            {userLinks?.user?.email}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Label
                            color={!checkActiveState(row) ? 'error' : checkActiveState(row) ? 'success' : 'error'}
                            className={clsx(!checkActiveState(row) ? classes.pointerCss : null)}
                          >
                            {checkActiveState(row) ? 'Active' : 'Activate'}
                          </Label>
                        </TableCell>
                        <TableCell align="left">
                          <Label
                            className={clsx(!is_help_send ? classes.pointerCss : null)}
                            color={!is_help_send ? 'error' : is_help_send ? 'success' : 'error'}
                          >
                            {!is_help_send ? 'Send Help' : is_help_send ? 'Active' : 'Send Help'}
                          </Label>
                        </TableCell>
                        {/* <TableCell align="left">
                          <Label color={!is_help_received ? 'error' : is_help_received ? 'success' : 'error'}>
                            {!is_help_received ? 'Pending' : is_help_received ? 'Received' : 'Pending'}
                          </Label>
                        </TableCell> */}
                        <TableCell align="right">
                          <IconButton
                            size="large"
                            color="inherit"
                            onClick={(event) => {
                              handleOpenMenu(event, row);
                            }}
                          >
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
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
            handleOpen();
          }}
        >
          <Iconify icon={'mdi:tick'} sx={{ mr: 2 }} />
          Approve
        </MenuItem>
      </Popover>

      <Modal
        open={openModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <CustomBox>
          <TextFieldPopup
            handleClose={handleClose}
            onDataSubmit={(helpToSendMember) => {
              handleApproveLinkHelpSend(helpToSendMember);
              handleClose();
              fetchData();
              setMsg('Help Sent Successfully');
              handleOpenSnackBar();
            }}
            title="Per Link Amount"
            textFieldType="number"
            textFieldLabel="Enter Per Link Amount"
          />
        </CustomBox>
      </Modal>

      <Modal
        open={openAproveAllModal}
        onClose={handleAllClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <CustomBox>
          <TextFieldPopup
            handleClose={handleAllClose}
            onDataSubmit={(helpToSendMember) => {
              onApproveSelected(helpToSendMember);
              handleAllClose();
            }}
            title="Per Link Amount"
            textFieldType="number"
            textFieldLabel="Enter Per Link Amount"
          />
        </CustomBox>
      </Modal>
    </>
  );
}
