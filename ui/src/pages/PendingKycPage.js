/* eslint-disable camelcase */
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
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
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { ListHead, ListToolbar } from '../sections/@dashboard/table';
// mock
import axiosInstance from '../helpers/axios';
import account from '../_mock/account';
import NewMember from '../components/members/NewMember';
import CustomBox from '../common/CustomBox';
import CommonSnackBar from '../common/CommonSnackBar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'email', label: 'Email', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'addreesProof', label: 'addreesProof', alignRight: false },
  { id: 'idProof', label: 'idProof', alignRight: false },
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

export default function PendingKycPage() {
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
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

  const [memberList, setMemberList] = useState([]);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [editUserData, setEditUserData] = useState({});

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openModal, setOpenMdal] = useState(false);

  const [msg, setMsg] = useState('');
  const [openSnackBar, setOpenSnackBar] = useState(false);

  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const handleOpen = () => setOpenMdal(true);
  const handleClose = () => setOpenMdal(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = memberList.map((n) => n.id);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - memberList.length) : 0;

  const filteredUsers = applySortFilter(memberList, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  const fetchData = () => {
    axiosInstance.get('users?filter[include][]=userProfile&filter[where][is_kyc_completed]=1').then((res) => {
      setMemberList(res.data);
    });
  };

  const handleApproveClick = (userData) => {
    userData = {
      ...userData,
      is_kyc_completed: 2,
    };
    axiosInstance
      .patch(`/approveDisapproveKyc`, userData)
      .then((res) => {
        handleOpenSnackBar();
        setErrorMessage('');
        setSuccessMessage('KYC Approved Successfully');
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
    userData = {
      ...userData,
      is_kyc_completed: 3,
    };
    axiosInstance
      .patch(`/approveDisapproveKyc`, userData)
      .then((res) => {
        handleOpenSnackBar();
        setErrorMessage('');
        setSuccessMessage('KYC Declined Successfully');
        handleCloseMenu();
        fetchData();
      })
      .catch((err) => {
        handleOpenSnackBar();
        setErrorMessage(err.response.data.error.message);
        handleOpenSnackBar();
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title> pendingKyc | CharityXchange </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Pending Kyc's
          </Typography>
          {/* 
          <Button
            variant="contained"
            component={RouterLink}
            to="#"
            startIcon={<Icon icon={plusFill} />}
            onClick={handleOpen}
          >
            New Member
          </Button> */}
        </Stack>

        <Card>
          <ListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={memberList.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, name, email, permissions, is_active, userProfile } = row;
                    const selectedUser = selected.indexOf(id) !== -1;
                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, id)} />
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              alt={name}
                              src={
                                userProfile?.userProfile?.avatar?.originalname
                                  ? userProfile?.userProfile?.avatar?.originalname
                                  : account.photoURL
                              }
                            />
                            <Typography variant="subtitle2" noWrap>
                              {name}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="left">{email}</TableCell>
                        <TableCell align="left">{permissions.toString()}</TableCell>

                        <TableCell align="left">
                          <Label color={(is_active === false && 'error') || 'success'}>
                            {is_active === false ? 'InActive' : 'Active'}
                          </Label>
                        </TableCell>

                        <TableCell align="left">
                          <Label
                            color="secondary"
                            onClick={() => window.open(userProfile?.addreesProof?.originalname, '_blank')}
                            style={{ cursor: 'pointer' }}
                          >
                            View
                          </Label>
                        </TableCell>

                        <TableCell align="left">
                          <Label
                            color="secondary"
                            onClick={() => window.open(userProfile?.idProof?.originalname, '_blank')}
                            style={{ cursor: 'pointer' }}
                          >
                            View
                          </Label>
                        </TableCell>

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
            count={memberList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
        <Modal
          open={openModal}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <CustomBox>
            <NewMember
              handleClose={handleClose}
              onDataSubmit={() => {
                handleClose();
                fetchData();
                setErrorMessage('');
                setSuccessMessage('Successfully Created New Member');
                handleOpenSnackBar();
              }}
            />
          </CustomBox>
        </Modal>
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
        <MenuItem sx={{ color: 'error.main' }}>
          <Iconify icon={'system-uicons:cross'} sx={{ mr: 2 }} />
          Decline
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleNavigate(`/users/${editUserData.id}`);
          }}
        >
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          View
        </MenuItem>
      </Popover>
    </>
  );
}
