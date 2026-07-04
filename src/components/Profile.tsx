import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Grid, Button, Avatar, Chip, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  TextField, MenuItem, Dialog, DialogTitle, DialogContent, 
  DialogActions, Card, CardContent, CircularProgress, Alert, useTheme
} from '@mui/material';
import { 
  Fingerprint as AttendanceIcon, 
  CalendarToday as LeaveIcon, 
  AddTask as ApproveIcon, 
  Cancel as RejectIcon, 
  Send as RequestIcon, 
  WorkOutlined as WorkIcon, 
  AttachMoney as CurrencyIcon 
} from '@mui/icons-material';
import { useAuth } from './AuthContext';
import { Attendance, Leave } from '../types';

export const Profile: React.FC = () => {
  const { user, employeeProfile } = useAuth();
  const theme = useTheme();

  // Common loading / message state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Employee specific states
  const [myAttendance, setMyAttendance] = useState<Attendance[]>([]);
  const [myLeaves, setMyLeaves] = useState<Leave[]>([]);
  const [checkedInToday, setCheckedInToday] = useState<boolean>(false);
  const [checkedOutToday, setCheckedOutToday] = useState<boolean>(false);
  
  // Submit Leave State
  const [leaveDialogOpen, setLeaveDialogOpen] = useState<boolean>(false);
  const [leaveType, setLeaveType] = useState<string>('ANNUAL');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState<string>('');

  // Admin specific states (review pending leaves)
  const [allPendingLeaves, setAllPendingLeaves] = useState<Leave[]>([]);

  const fetchPortalData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (employeeProfile) {
        // Load logged in Employee logs
        const [attRes, leaveRes] = await Promise.all([
          axios.get(`/api/attendance/employee/${employeeProfile.id}`),
          axios.get(`/api/leaves/employee/${employeeProfile.id}`)
        ]);
        
        setMyAttendance(attRes.data);
        setMyLeaves(leaveRes.data);

        // Check today's status
        const today = new Date().toISOString().split('T')[0];
        const todayLog = attRes.data.find((a: Attendance) => a.date === today);
        if (todayLog) {
          setCheckedInToday(true);
          setCheckedOutToday(!!todayLog.checkOut);
        } else {
          setCheckedInToday(false);
          setCheckedOutToday(false);
        }
      } else if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_HR') {
        // Load leaves awaiting HR review
        const leavesRes = await axios.get('/api/leaves');
        setAllPendingLeaves(leavesRes.data.filter((l: Leave) => l.status === 'PENDING'));
      }
    } catch (e) {
      console.error("Portal fetch failed", e);
      setError("Unable to synchronize logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [employeeProfile]);

  // Handle Check In
  const handleCheckIn = async () => {
    if (!employeeProfile) return;
    setError(null);
    setSuccess(null);
    try {
      await axios.post(`/api/attendance/check-in/${employeeProfile.id}`);
      setSuccess("Successfully checked in for today!");
      fetchPortalData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Check-in failed");
    }
  };

  // Handle Check Out
  const handleCheckOut = async () => {
    if (!employeeProfile) return;
    setError(null);
    setSuccess(null);
    try {
      await axios.post(`/api/attendance/check-out/${employeeProfile.id}`);
      setSuccess("Successfully checked out! Have a great evening.");
      fetchPortalData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Check-out failed");
    }
  };

  // Submit Leave
  const handleRequestLeave = async () => {
    if (!employeeProfile) return;
    setError(null);
    setSuccess(null);
    try {
      await axios.post(`/api/leaves/request/${employeeProfile.id}`, {
        leaveType,
        startDate,
        endDate,
        reason: leaveReason
      });
      setSuccess("Leave request submitted successfully. Awaiting HR approval.");
      setLeaveDialogOpen(false);
      setLeaveReason('');
      fetchPortalData();
    } catch (err: any) {
      setError("Submission failed. Ensure dates are configured.");
    }
  };

  // Review Leaves (Admin)
  const handleReviewLeave = async (leaveId: number, status: 'APPROVED' | 'REJECTED') => {
    setError(null);
    setSuccess(null);
    try {
      await axios.put(`/api/leaves/${leaveId}/review`, {
        status,
        reviewer: user?.email
      });
      setSuccess(`Leave request has been ${status.toLowerCase()}`);
      fetchPortalData();
    } catch (e) {
      setError("Failed to submit review.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Employee Portal & Actions</Typography>
        <Typography variant="body1" color="text.secondary">
          {employeeProfile ? "Log daily attendance, request leaves, and review your payroll allocations." : "Review pending leave requests submitted by division staff."}
        </Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 1 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 1 }}>{success}</Alert>}

      {/* IF LOGGED IN USER IS A STAFF EMPLOYEE */}
      {employeeProfile ? (
        <Grid container spacing={3}>
          {/* LEFT COLUMN: Profile Details and Check in */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Profile card */}
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Avatar 
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: theme.palette.secondary.main, fontSize: '2.5rem', fontWeight: 700 }}
                  >
                    {employeeProfile.firstName.charAt(0)}{employeeProfile.lastName.charAt(0)}
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {employeeProfile.firstName} {employeeProfile.lastName}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                    {employeeProfile.designation} • {employeeProfile.departmentName}
                  </Typography>
                  <Chip label="ONLINE PORTAL" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                </CardContent>
              </Card>

              {/* Attendance Tracker Punch Widget */}
              <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#eff6ff' }}>
                <CardContent sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <AttendanceIcon color="primary" /> Attendance Roll-Call
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleCheckIn}
                      disabled={checkedInToday}
                      size="large"
                      sx={{ borderRadius: 3, flex: 1, py: 1.5 }}
                    >
                      {checkedInToday ? "Checked In" : "Check In"}
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={handleCheckOut}
                      disabled={!checkedInToday || checkedOutToday}
                      size="large"
                      sx={{ borderRadius: 3, flex: 1, py: 1.5 }}
                    >
                      {checkedOutToday ? "Checked Out" : "Check Out"}
                    </Button>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Standard schedule: 09:00 AM - 05:00 PM. Checks after 09:30 AM count as Late.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* RIGHT COLUMN: Leave Request lists & History tables */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Leaves Summary and request */}
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>My Leave Bookings</Typography>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    startIcon={<LeaveIcon />} 
                    onClick={() => setLeaveDialogOpen(true)}
                  >
                    File Leave Request
                  </Button>
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Approver</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myLeaves.length > 0 ? (
                        myLeaves.map((l) => (
                          <TableRow key={l.id}>
                            <TableCell><Chip label={l.leaveType} size="small" /></TableCell>
                            <TableCell>{l.startDate} to {l.endDate}</TableCell>
                            <TableCell>{l.reason || '--'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={l.status} 
                                size="small" 
                                color={l.status === 'APPROVED' ? 'success' : l.status === 'PENDING' ? 'warning' : 'error'}
                                sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                              />
                            </TableCell>
                            <TableCell>{l.approvedBy || '--'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                            No leaves recorded. Click 'File Leave Request' to submit.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Attendance logs lists */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>Recent Attendance Logs</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Punch In</TableCell>
                        <TableCell>Punch Out</TableCell>
                        <TableCell>Roll Call</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myAttendance.length > 0 ? (
                        myAttendance.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell>{a.date}</TableCell>
                            <TableCell>{a.checkIn || '--'}</TableCell>
                            <TableCell>{a.checkOut || '--'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={a.status} 
                                size="small" 
                                color={a.status === 'PRESENT' ? 'success' : a.status === 'LATE' ? 'warning' : 'error'}
                                sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                            No attendance logs registered in this roster period.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      ) : (
        /* OTHERWISE IF LOGGED IN USER IS ADMIN/HR IN CHARGE OF REVIEWS */
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Pending Leave Authorizations</Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee Applicant</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allPendingLeaves.length > 0 ? (
                  allPendingLeaves.map((l) => (
                    <TableRow key={l.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{l.employeeName}</TableCell>
                      <TableCell><Chip label={l.leaveType} size="small" /></TableCell>
                      <TableCell>{l.startDate} to {l.endDate}</TableCell>
                      <TableCell>{l.reason || '--'}</TableCell>
                      <TableCell align="right">
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small"
                          startIcon={<ApproveIcon />}
                          onClick={() => handleReviewLeave(l.id, 'APPROVED')}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          startIcon={<RejectIcon />}
                          onClick={() => handleReviewLeave(l.id, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">All employee leave requests have been resolved. Excellent work!</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* FILE LEAVE DIALOG */}
      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>File Leave Request</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              select
              label="Leave Classification"
              fullWidth
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <MenuItem value="ANNUAL">Annual Leaves</MenuItem>
              <MenuItem value="SICK">Medical/Sick Leaves</MenuItem>
              <MenuItem value="CASUAL">Casual Leaves</MenuItem>
              <MenuItem value="UNPAID">Unpaid Career Breaks</MenuItem>
            </TextField>
            <TextField
              type="date"
              label="Start Date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              type="date"
              label="End Date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <TextField
              label="Reason for Absence"
              fullWidth
              multiline
              rows={3}
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setLeaveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRequestLeave} 
            variant="contained" 
            color="secondary"
            startIcon={<RequestIcon />}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
