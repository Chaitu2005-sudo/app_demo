import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Typography, Button, TextField, MenuItem, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  TablePagination, IconButton, Chip, Avatar, Dialog, DialogTitle, 
  DialogContent, DialogActions, Grid, CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon, 
  Download as CSVIcon, 
  Search as SearchIcon, 
  FilterList as FilterIcon 
} from '@mui/icons-material';
import { Employee, Department } from '../types';
import { useAuth } from './AuthContext';

export const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters & Page settings
  const [search, setSearch] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  
  // Deletion state
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/employees', {
        params: {
          search,
          departmentId: departmentFilter || undefined,
          status: statusFilter || undefined,
          page,
          size: rowsPerPage
        }
      });
      setEmployees(res.data.content);
      setTotalElements(res.data.totalElements);
    } catch (e) {
      console.error("Could not load employee details", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/departments');
      setDepartments(res.data);
    } catch (e) {
      console.error("Could not fetch departments list", e);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [search, departmentFilter, statusFilter, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await axios.delete(`/api/employees/${deleteId}`);
        fetchEmployees();
      } catch (e) {
        console.error("Deletion failed", e);
      } finally {
        setDeleteId(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'ACTIVE') return 'success';
    if (status === 'INACTIVE') return 'warning';
    return 'error';
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    if (employees.length === 0) return;
    const headers = ['Employee ID', 'First Name', 'Last Name', 'Email', 'Phone Number', 'Department', 'Designation', 'Salary', 'Joining Date', 'Status'];
    const csvRows = [headers.join(',')];

    employees.forEach(e => {
      const row = [
        e.id,
        `"${e.firstName}"`,
        `"${e.lastName}"`,
        e.email,
        e.phoneNumber,
        `"${e.departmentName}"`,
        `"${e.designation}"`,
        e.salary,
        e.joiningDate,
        e.status
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canEdit = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_HR';
  const canDelete = user?.role === 'ROLE_ADMIN';

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Employee Rosters</Typography>
          <Typography variant="body1" color="text.secondary">Browse, manage, search and filter all registered corporate employees.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            startIcon={<CSVIcon />} 
            onClick={handleExportCSV}
            disabled={employees.length === 0}
          >
            Export CSV
          </Button>
          {canEdit && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />} 
              onClick={() => navigate('/employees/add')}
            >
              Add Employee
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters Card */}
      <Paper sx={{ p: 2.5 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Search Employee"
              placeholder="Name, email, designation..."
              variant="outlined"
              size="small"
              fullWidth
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Department"
              variant="outlined"
              size="small"
              fullWidth
              value={departmentFilter}
              onChange={(e) => { setDepartmentFilter(e.target.value); setPage(0); }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Status"
              variant="outlined"
              size="small"
              fullWidth
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
              <MenuItem value="TERMINATED">Terminated</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: 'right' }}>
            <Button 
              color="inherit" 
              onClick={() => { setSearch(''); setDepartmentFilter(''); setStatusFilter(''); setPage(0); }}
              disabled={!search && !departmentFilter && !statusFilter}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table Layer */}
      <TableContainer component={Paper} sx={{ flex: 1, minHeight: 400 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Contact Information</TableCell>
                <TableCell>Salary</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length > 0 ? (
                employees.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 600 }}>
                          {e.firstName.charAt(0)}{e.lastName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {e.firstName} {e.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">ID: EMP{e.id}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{e.departmentName || 'Unassigned'}</TableCell>
                    <TableCell>{e.designation}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2">{e.email}</Typography>
                        <Typography variant="caption" color="text.secondary">{e.phoneNumber}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>${e.salary.toLocaleString()}/yr</TableCell>
                    <TableCell>
                      <Chip 
                        label={e.status} 
                        size="small" 
                        color={getStatusColor(e.status)} 
                        sx={{ fontWeight: 'bold', fontSize: '0.72rem' }} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="info" onClick={() => navigate(`/employees/${e.id}`)}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      {canEdit && (
                        <IconButton color="primary" onClick={() => navigate(`/employees/edit/${e.id}`)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {canDelete && (
                        <IconButton color="error" onClick={() => setDeleteId(e.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No employee accounts found matching criteria.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Pagination component */}
      {!loading && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Confirmation Dialog overlay */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Roster Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you absolutely sure you want to delete this employee? This action is irreversible, will purge all associate logs and user profiles.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
