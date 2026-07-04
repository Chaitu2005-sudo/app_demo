import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, 
  Grid, CircularProgress, Chip 
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Business as DivisionIcon, 
  Person as ManagerIcon 
} from '@mui/icons-material';
import { Department, Employee } from '../types';
import { useAuth } from './AuthContext';

export const Departments: React.FC = () => {
  const { user } = useAuth();
  
  // State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formHeadId, setFormHeadId] = useState<number | string>('');

  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchDepartmentsAndEmployees = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        axios.get('/api/departments'),
        axios.get('/api/employees', { params: { size: 100 } }) // Get large pool for HOD
      ]);
      setDepartments(deptRes.data);
      setEmployees(empRes.data.content || []);
    } catch (e) {
      console.error("Could not load departments", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsAndEmployees();
  }, []);

  const handleOpenDialog = (dept: Department | null = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormName(dept.name);
      setFormDescription(dept.description);
      setFormHeadId(dept.headId || '');
    } else {
      setEditingDept(null);
      setFormName('');
      setFormDescription('');
      setFormHeadId('');
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;

    const payload = {
      name: formName,
      description: formDescription,
      headId: formHeadId ? parseInt(formHeadId as string) : null
    };

    try {
      if (editingDept) {
        await axios.put(`/api/departments/${editingDept.id}`, payload);
      } else {
        await axios.post('/api/departments', payload);
      }
      setDialogOpen(false);
      fetchDepartmentsAndEmployees();
    } catch (e) {
      console.error("Could not save department", e);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await axios.delete(`/api/departments/${deleteId}`);
        fetchDepartmentsAndEmployees();
      } catch (e) {
        console.error("Could not delete department", e);
      } finally {
        setDeleteId(null);
      }
    }
  };

  const canEdit = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_HR';
  const canDelete = user?.role === 'ROLE_ADMIN';

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Corporate Divisions</Typography>
          <Typography variant="body1" color="text.secondary">Create, organize, and allocate departments and set HODs.</Typography>
        </Box>
        {canEdit && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenDialog(null)}
          >
            Create Department
          </Button>
        )}
      </Box>

      {/* Main Table Paper */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Division Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Department Head (HOD)</TableCell>
                <TableCell>Active Headcount</TableCell>
                {canEdit && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <TableRow key={dept.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DivisionIcon color="primary" fontSize="small" />
                        {dept.name}
                      </Box>
                    </TableCell>
                    <TableCell>{dept.description || '--'}</TableCell>
                    <TableCell>
                      {dept.headName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ManagerIcon color="secondary" fontSize="small" />
                          <Typography variant="body2">{dept.headName}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">Vacant</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${dept.employeeCount || 0} Employees`} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    {canEdit && (
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleOpenDialog(dept)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {canDelete && (
                          <IconButton color="error" onClick={() => setDeleteId(dept.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No departments registered. Click 'Create Department' to add one.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* CREATE / EDIT DIALOG BOX */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingDept ? 'Update Division Details' : 'Create Division'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Department Name"
              required
              fullWidth
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
            <TextField
              select
              label="Department Head (HOD)"
              fullWidth
              value={formHeadId}
              onChange={(e) => setFormHeadId(e.target.value)}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.designation})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!formName.trim()}
          >
            Save Division
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Division Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this department? Employees assigned to this department will be set to unassigned.
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
