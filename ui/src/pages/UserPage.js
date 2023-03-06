/* eslint-disable no-unneeded-ternary */
/* eslint-disable camelcase */
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import MaterialTable, { MTableToolbar } from 'material-table';
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
import { TreeItem } from '@mui/lab';
import LoadingScreen from '../common/LoadingScreen';
import { convertData, tableIcons } from '../utils/constants';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
// mock
import axiosInstance from '../helpers/axios';
import account from '../_mock/account';
import NewMember from '../components/members/NewMember';
import CustomBox from '../common/CustomBox';
import CommonSnackBar from '../common/CommonSnackBar';
import MemberTree from '../components/members/MemberTree';

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

export default function UserPage() {
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
  const [loading, setLoading] = useState(false);
  const [isTreeView, setIsTreeView] = useState(false);

  const [memberList, setMemberList] = useState([]);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [userProfile, setUserProfile] = useState();

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

  const handleNavigate = (url) => {
    navigate(url);
  };

  const handleOpenMenu = (event, row) => {
    setOpen(event.currentTarget);
    setEditUserData(row);
  };

  const role = localStorage.getItem('permissions');
  const permissions = role && role.split(',');

  const TABLE_HEAD = [
    {
      title: 'Name',
      render: (row) => (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            alt={row.name}
            src={row.userProfile?.avatar?.originalname ? row.userProfile?.avatar?.originalname : account.photoURL}
          />
          <Typography variant="subtitle2" noWrap>
            {row.name}
          </Typography>
        </Stack>
      ),
    },
    { field: 'email', title: 'Email' },
    {
      title: 'Role',
      render: (row) => row.permissions.toString(),
    },
    {
      title: 'Status',
      render: (row) => (
        <Label color={(row.is_active === false && 'error') || 'success'}>
          {row.is_active === false ? 'InActive' : 'Active'}
        </Label>
      ),
    },
    {
      title: '',
      render: (row) =>
        permissions &&
        permissions.includes('super_admin') && (
          <div>
            <IconButton
              size="large"
              color="inherit"
              onClick={(event) => {
                handleOpenMenu(event, row);
              }}
            >
              <Iconify icon={'eva:more-vertical-fill'} />
            </IconButton>
          </div>
        ),
    },
  ];

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
  const fetchCurrentUserData = () => {
    setLoading(true);
    axiosInstance
      .get('users/me')
      .then((res) => {
        setLoading(false);
        setUserProfile(res.data);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const fetchData = () => {
    setLoading(true);
    if (permissions && permissions.includes('super_admin')) {
      axiosInstance
        .get('users?filter[include][0]=userProfile&filter[include][1]=balance_user')
        .then((res) => {
          setLoading(false);
          setMemberList(res.data);
        })
        .catch((err) => {
          setLoading(false);
        });
    } else {
      axiosInstance
        .get(`getAllDescendantsOfUser`)
        .then((res) => {
          setMemberList(res.data);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    }
  };

  const handleReloadData = (event) => {
    fetchData();
  };

  useEffect(() => {
    fetchCurrentUserData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [userProfile]);
  return (
    <>
      {loading ? <LoadingScreen /> : null}
      <Helmet>
        <title> Investors | CharityXchange </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Investors
          </Typography>

          <Button
            variant="contained"
            component={RouterLink}
            to="#"
            startIcon={<Icon icon={plusFill} />}
            onClick={handleOpen}
            disabled={userProfile?.activePayment ? false : permissions.includes('super_admin') ? false : true}
          >
            New Investor
          </Button>
        </Stack>
        <Stack direction="row" alignItems="end" justifyContent="space-between" mb={0}>
          {!userProfile?.activePayment ? (
            <Typography variant="caption" gutterBottom>
              Note*: Please activate the plan in order to begin referring and earning.
            </Typography>
          ) : null}

          <Typography
            variant="caption"
            gutterBottom
            onClick={() => {
              setIsTreeView(!isTreeView);
            }}
            style={{
              color: 'blue',
              cursor: 'pointer',
            }}
          >
            {isTreeView ? 'show table view' : 'show tree view'}
          </Typography>
        </Stack>

        {/* <Card>
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
                isCheckbox={permissions && permissions.includes('super_admin')}
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
                  const { id, name, email, permissions:userPermissions, is_active, userProfile } = row;
                  const selectedUser = selected.indexOf(id) !== -1;
                  return (
                    <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                      {permissions && permissions.includes('super_admin') && (
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, id)} />
                        </TableCell>
                      )}

                      <TableCell component="th" scope="row" padding="none">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            alt={name}
                            src={
                              userProfile?.avatar?.originalname ? userProfile?.avatar?.originalname : account.photoURL
                            }
                            style={{marginLeft:'10px'}}
                          />
                          <Typography variant="subtitle2" noWrap>
                            {name}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell align="left">{email}</TableCell>
                      <TableCell align="left">{userPermissions.toString()}</TableCell>

                      <TableCell align="left">
                        <Label color={(is_active === false && 'error') || 'success'}>
                          {is_active === false ? 'InActive' : 'Active'}
                        </Label>
                      </TableCell>
                      {permissions && permissions.includes('super_admin') && (
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
                      )}
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
      </Card> */}
        {!isTreeView ? (
          <MaterialTable
            data={memberList}
            columns={TABLE_HEAD}
            parentChildData={(row, rows) => rows.find((a) => a.id === row.parent_id)}
            options={{
              selection: permissions && permissions.includes('super_admin'),
              showTitle: false,
            }}
            icons={tableIcons}
            // components={{
            //   Toolbar: (props) => (
            //     <div
            //       style={{
            //         display: 'flex',
            //         justifyContent: 'space-between',
            //         alignItems: 'center',
            //       }}
            //     >
            //       <div>
            //         <MTableToolbar {...props} />
            //       </div>
            //       <div
            //         style={{
            //           marginRight: '20px',
            //         }}
            //       >
            //         <Tooltip title="Reload">
            //           <IconButton onClick={handleReloadData}>
            //             <Iconify icon="mdi:reload" />
            //           </IconButton>
            //         </Tooltip>
            //       </div>
            //     </div>
            //   ),
            //   Container: (props) => <Paper {...props} elevation={8} />,
            // }}
          />
        ) : (
          <MemberTree
            treeData={
              permissions && permissions.includes('super_admin')
                ? convertData(memberList)
                : convertData(memberList, userProfile.id)
            }
          />
        )}

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
                setMsg('Successfully Created New Member');
                handleOpenSnackBar();
              }}
            />
          </CustomBox>
        </Modal>
      </Container>
      <CommonSnackBar
        openSnackBar={openSnackBar}
        handleCloseSnackBar={handleCloseSnackBar}
        msg={msg}
        severity="success"
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
          onClick={() => {
            handleNavigate(`/users/${editUserData.id}`);
          }}
        >
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}
