import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { 
  Box, Typography, Button, Paper, TextField, MenuItem, 
  Grid, CircularProgress, Alert 
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { Department } from '../types';

interface EmployeeFormInputs {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  departmentId: number | string;
  designation: string;
  salary: number;
  joiningDate: string;
  address: string;
  status: string;
}

export const EmployeeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<EmployeeFormInputs>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      departmentId: '',
      designation: '',
      salary: 50000,
      joiningDate: new Date().toISOString().split('T')[0],
      address: '',
      status: 'ACTIVE'
    }
  });

  useEffect(() => {
    const loadFormContext = async () => {
      try {
        const deptRes = await axios.get('/api/departments');
        setDepartments(deptRes.data);

        if (isEditMode) {
          const empRes = await axios.get(`/api/employees/${id}`);
          const emp = empRes.data;
          // Set form values
          setValue('firstName', emp.firstName);
          setValue('lastName', emp.lastName);
          setValue('email', emp.email);
          setValue('phoneNumber', emp.phoneNumber);
          setValue('departmentId', emp.departmentId || '');
          setValue('designation', emp.designation);
          setValue('salary', emp.salary);
          setValue('joiningDate', emp.joiningDate);
          setValue('address', emp.address);
          setValue('status', emp.status);
        }
      } catch (e) {
        console.error("Could not load form context", e);
      } finally {
        setLoading(false);
      }
    };
    loadFormContext();
  }, [id, isEditMode, setValue]);

  const onSubmit = async (data: EmployeeFormInputs) => {
    setSubmitError(null);
    try {
      if (isEditMode) {
        await axios.put(`/api/employees/${id}`, data);
      } else {
        await axios.post('/api/employees', data);
      }
      navigate('/employees');
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit form. Please check validations.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/employees')} color="inherit">
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {isEditMode ? 'Edit Employee Profile' : 'Add New Employee'}
        </Typography>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
      )}

      <Paper sx={{ p: 4 }} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Personal & Career Information</Typography>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="firstName"
              control={control}
              rules={{ required: 'First name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="First Name"
                  fullWidth
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="lastName"
              control={control}
              rules={{ required: 'Last name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Last Name"
                  fullWidth
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="email"
              control={control}
              rules={{ 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: 'Invalid email address'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  fullWidth
                  disabled={isEditMode} // Usually email shouldn't change for unique profiles
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone Number"
                  fullWidth
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="departmentId"
              control={control}
              rules={{ required: 'Department is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Department Allocation"
                  fullWidth
                  error={!!errors.departmentId}
                  helperText={errors.departmentId?.message}
                >
                  <MenuItem value="">Select Department</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="designation"
              control={control}
              rules={{ required: 'Designation is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Job Title / Designation"
                  fullWidth
                  error={!!errors.designation}
                  helperText={errors.designation?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="salary"
              control={control}
              rules={{ 
                required: 'Salary is required',
                min: { value: 0, message: 'Salary must be a positive number' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Annual Salary ($)"
                  fullWidth
                  error={!!errors.salary}
                  helperText={errors.salary?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="joiningDate"
              control={control}
              rules={{ required: 'Joining date is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Joining Date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors.joiningDate}
                  helperText={errors.joiningDate?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Residential Address"
                  fullWidth
                  multiline
                  rows={2}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="status"
              control={control}
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Employment Status"
                  fullWidth
                  error={!!errors.status}
                  helperText={errors.status?.message}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="TERMINATED">Terminated</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              size="large"
              startIcon={<SaveIcon />}
              sx={{ minWidth: 150 }}
            >
              Save Employee
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
