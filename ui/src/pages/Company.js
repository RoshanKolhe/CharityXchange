import axios from 'axios';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
// material
import {
  Card,
  Table,
  Stack,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
  TablePagination,
  Container,
  Modal,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
// components
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';

//
import { CompanyListHead, CompanyListToolbar } from '../components/company';
import NewCompany from '../components/company/NewCompany';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ID', label: 'ID', alignRight: false },
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'domain', label: 'Domain', alignRight: false },
  { id: 'websiteUrl', label: 'Web URL', alignRight: false },
  { id: 'naicsCode', label: 'NAICS code', alignRight: false },
  { id: 'yelpUrl', label: 'Yelp URL', alignRight: false },
  { id: 'g2CrowdUrl', label: 'G2Crowd Url', alignRight: false },
  { id: 'tags', label: 'Tags', alignRight: false },
  { id: 'createdOn', label: 'Created on', alignRight: false },
  { id: 'updatedOn', label: 'Updated on', alignRight: false },
  { id: 'lastModifiedBy', label: 'Last Modified By', alignRight: false }
];

// ----------------------------------------------------------------------

// function descendingComparator(a, b, orderBy) {
//   if (b[orderBy] < a[orderBy]) {
//     return -1;
//   }
//   if (b[orderBy] > a[orderBy]) {
//     return 1;
//   }
//   return 0;
// }

// function getComparator(order, orderBy) {
//   return order === 'desc'
//     ? (a, b) => descendingComparator(a, b, orderBy)
//     : (a, b) => -descendingComparator(a, b, orderBy);
// }

// function applySortFilter(array, comparator, query) {
//   const stabilizedThis = array.map((el, index) => [el, index]);
//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });
//   if (query) {
//     return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
//   }
//   return stabilizedThis.map((el) => el[0]);
// }

export default function Company() {
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
    pb: 3
  };
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const handleOpenSnackBar = () => setOpenSnackBar(true);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredUsers.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    console.log(name, 'name');
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    console.log('newSelected', newSelected);
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredUsers.length) : 0;

  const isUserNotFound = filteredUsers.length === 0;

  async function fetchData() {
    // You can await here
    const result = await axios.get('http://localhost:3005/companies', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setFilteredUsers(result?.data);
  }

  async function deleteComapny(id) {
    await axios.delete(`http://localhost:3005/companies/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchData();
    setSelected([]);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Page title="Companies" id="companiesPage">
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Companies
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="#"
            startIcon={<Icon icon={plusFill} />}
            onClick={handleOpen}
          >
            New Company
          </Button>
        </Stack>

        <Card>
          <CompanyListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            onDelete={() => {
              console.log('selected', selected);
              selected.forEach((id) => {
                deleteComapny(id);
              });
            }}
          />

          <Scrollbar>
            <TableContainer>
              <Table>
                <CompanyListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={filteredUsers.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const {
                        id,
                        name,
                        domain,
                        websiteUrl,
                        naicsCode,
                        yelpUrl,
                        g2CrowdUrl,
                        tags,
                        createdOn,
                        updatedOn,
                        lastModifiedBy
                      } = row;
                      const isItemSelected = selected.indexOf(id) !== -1;

                      return (
                        <TableRow
                          hover
                          key={id}
                          tabIndex={-1}
                          role="checkbox"
                          selected={isItemSelected}
                          aria-checked={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={(event) => handleClick(event, id)}
                            />
                          </TableCell>
                          <TableCell align="left">{id}</TableCell>
                          <TableCell align="left">{name}</TableCell>
                          <TableCell align="left">{domain}</TableCell>
                          <TableCell align="left">{websiteUrl}</TableCell>
                          <TableCell align="left">{naicsCode}</TableCell>
                          <TableCell align="left">{yelpUrl}</TableCell>
                          <TableCell align="left">{g2CrowdUrl}</TableCell>
                          <TableCell align="left">{tags}</TableCell>
                          <TableCell align="left">{createdOn}</TableCell>
                          <TableCell align="left">{updatedOn}</TableCell>
                          <TableCell align="left">{lastModifiedBy}</TableCell>
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={12} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
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
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <NewCompany
              onDataSubmit={() => {
                handleClose();
                fetchData();
                handleOpenSnackBar();
              }}
            />
          </Box>
        </Modal>

        <Snackbar open={openSnackBar} autoHideDuration={6000} onClose={handleCloseSnackBar}>
          <Alert onClose={handleCloseSnackBar} severity="success" sx={{ width: '100%' }}>
            Successfully Created Company
          </Alert>
        </Snackbar>
      </Container>
    </Page>
  );
}
