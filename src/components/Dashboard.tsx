import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Grid, Card, CardContent, Typography, Box, Paper, 
  List, ListItem, ListItemText, ListItemIcon, Divider, 
  CircularProgress, useTheme, Chip, Avatar 
} from '@mui/material';
import { 
  PeopleAlt as EmployeesIcon, 
  CheckCircle as ActiveIcon, 
  CorporateFare as DeptIcon, 
  TimeToLeave as LeaveIcon, 
  NotificationsActive as ActivityIcon 
} from '@mui/icons-material';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { DashboardStats, AuditLog } from '../types';

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/audit-logs')
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data.slice(0, 5)); // Just take recent 5
      } catch (e) {
        console.error("Could not fetch dashboard metadata", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={45} />
      </Box>
    );
  }

  // Formatting chart data
  const deptChartData = Object.entries(stats.departmentDistribution).map(([name, count]) => ({
    name,
    Employees: count
  }));

  const attendanceChartData = [
    { name: 'Present', value: stats.attendanceStatusToday.Present || 0 },
    { name: 'Late', value: stats.attendanceStatusToday.Late || 0 },
    { name: 'Absent', value: stats.attendanceStatusToday.Absent || 0 },
    { name: 'On Leave', value: stats.attendanceStatusToday.Leave || 0 },
  ].filter(item => item.value > 0);

  // Defaults if no logs
  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  const kpis = [
    { title: 'Total Workforce', value: stats.totalEmployees, icon: <EmployeesIcon fontSize="large" />, color: '#3b82f6', desc: 'Active + inactive rosters' },
    { title: 'Active Rosters', value: stats.activeEmployees, icon: <ActiveIcon fontSize="large" />, color: '#10b981', desc: 'Actively logged employees' },
    { title: 'Total Divisions', value: stats.totalDepartments, icon: <DeptIcon fontSize="large" />, color: '#8b5cf6', desc: 'Operating business divisions' },
    { title: 'Pending Days Off', value: stats.pendingLeaves, icon: <LeaveIcon fontSize="large" />, color: '#f59e0b', desc: 'Awaiting approvals' }
  ];

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      {/* Greetings Header banner */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Welcome Back!</Typography>
        <Typography variant="body1" color="text.secondary">
          Here is a high-level operational overview of Enterprise Corp as of today, July 4, 2026.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3}>
        {kpis.map((kpi) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={kpi.title}>
            <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {kpi.title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, my: 1.5 }}>
                      {kpi.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: kpi.color, width: 52, height: 52 }}>
                    {kpi.icon}
                  </Avatar>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.78rem' }}>
                  {kpi.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Layer */}
      <Grid container spacing={3}>
        {/* Department chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, height: 380, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Workforce Distribution by Division</Typography>
            {deptChartData.length > 0 ? (
              <Box sx={{ flex: 1, width: '100%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} />
                    <YAxis stroke={theme.palette.text.secondary} fontSize={12} allowDecimals={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme.palette.background.paper, 
                        borderColor: theme.palette.divider,
                        borderRadius: 8
                      }} 
                    />
                    <Bar dataKey="Employees" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography color="text.secondary">No department rosters registered yet</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Attendance chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, height: 380, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Today's Roll Call Status</Typography>
            {attendanceChartData.length > 0 ? (
              <Box sx={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: '100%', height: 210 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {attendanceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                {/* Attendance Legend indicators */}
                <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                  {attendanceChartData.map((item, index) => (
                    <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length] }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {item.name}: {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography color="text.secondary">Check-ins have not started today</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Audit Log / Activities Rails */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Operational Activities</Typography>
              <Chip label="Real-time Feed" color="success" size="small" sx={{ fontWeight: 'bold' }} variant="outlined" />
            </Box>
            <List sx={{ p: 0 }}>
              {logs.map((log, idx) => (
                <React.Fragment key={log.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover', color: 'text.secondary' }}>
                        <ActivityIcon fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <Box sx={{ flex: '1 1 auto', minWidth: 0, my: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {log.action}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(log.timestamp).toLocaleTimeString()} - IP: {log.ipAddress}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'inline' }}>
                          {log.details}
                        </Typography>
                        <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5, fontWeight: 500 }}>
                          Initiator: {log.executedBy}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                  {idx < logs.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
