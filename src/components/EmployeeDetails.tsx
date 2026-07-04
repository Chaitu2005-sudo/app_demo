import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Typography, Button, Paper, Grid, Avatar, Divider, 
  Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, 
  CircularProgress, Chip, IconButton 
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  Edit as EditIcon, 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  LocationOn as AddressIcon, 
  CalendarToday as DateIcon, 
  MonetizationOn as SalaryIcon, 
  Badge as BadgeIcon 
} from '@mui/icons-material';
import { Employee, Attendance, Leave } from '../types';
import { useAuth } from './AuthContext';

export const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empRes, attRes, leaveRes] = await Promise.all([
          axios.get(`/api/employees/${id}`),
          axios.get(`/api/attendance/employee/${id}`),
          axios.get(`/api/leaves/employee/${id}`)
        ]);
        setEmployee(empRes.data);
        setAttendance(attRes.data);
        setLeaves(leaveRes.data);
      } catch (e) {
        console.error("Could not fetch detailed employee history", e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Employee record not found</Typography>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/employees')} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    if (status === 'ACTIVE') return 'success';
    if (status === 'INACTIVE') return 'warning';
    return 'error';
  };

  const getLeaveStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'success';
    if (status === 'PENDING') return 'warning';
    return 'error';
  };

  const canEdit = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_HR';

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header navigations */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/employees')} color="inherit">
          Back to List
        </Button>
        {canEdit && (
          <Button 
            variant="contained" 
            startIcon={<EditIcon />} 
            onClick={() => navigate(`/employees/edit/${employee.id}`)}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      {/* Main Employee Card */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar 
              sx={{ width: 140, height: 140, bgcolor: 'primary.main', fontSize: '3.5rem', fontWeight: 'bold' }}
            >
              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
            </Avatar>
          </Grid>
          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {employee.firstName} {employee.lastName}
              </Typography>
              <Chip 
                label={employee.status} 
                color={getStatusColor(employee.status)} 
                sx={{ fontWeight: 'bold' }} 
              />
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, mb: 2 }}>
              {employee.designation} • {employee.departmentName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Employee ID: <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>EMP{employee.id}</Box>
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Segmented detail views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="profile detail tabs">
          <Tab label="Detailed Info" sx={{ fontWeight: 600 }} />
          <Tab label="Attendance History" sx={{ fontWeight: 600 }} />
          <Tab label="Leaves Registry" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* TAB PANELS */}
      <Box sx={{ flex: 1 }}>
        {activeTab === 0 && (
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>Contact Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmailIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Corporate Email</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{employee.email}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PhoneIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Contact Number</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{employee.phoneNumber || 'Not configured'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AddressIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Residential Address</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{employee.address || 'Not configured'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 3 }} />

              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>Contract Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SalaryIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Annual Salary Base</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>${employee.salary.toLocaleString()} / year</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DateIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Joining Date</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{new Date(employee.joiningDate).toLocaleDateString()}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BadgeIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Division Allocation</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{employee.departmentName || 'Unassigned'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {activeTab === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Check-in Time</TableCell>
                  <TableCell>Check-out Time</TableCell>
                  <TableCell>Daily Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.length > 0 ? (
                  attendance.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>{log.date}</TableCell>
                      <TableCell>{log.checkIn || '--'}</TableCell>
                      <TableCell>{log.checkOut || '--'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={log.status} 
                          size="small" 
                          color={log.status === 'PRESENT' ? 'success' : log.status === 'LATE' ? 'warning' : 'error'} 
                          sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No attendance logs logged for this employee.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 2 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Approval Status</TableCell>
                  <TableCell>Approved By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.length > 0 ? (
                  leaves.map((leave) => (
                    <TableRow key={leave.id} hover>
                      <TableCell>
                        <Chip label={leave.leaveType} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{leave.startDate} to {leave.endDate}</TableCell>
                      <TableCell>{leave.reason || '--'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={leave.status} 
                          size="small" 
                          color={getLeaveStatusColor(leave.status)}
                          sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>{leave.approvedBy || '--'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No leaf requests found for this employee.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};
