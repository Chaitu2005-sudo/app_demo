import React, { useState } from 'react';
import { 
  Box, Typography, Paper, FormControlLabel, Switch, 
  Button, TextField, Grid, Alert, Divider 
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Notifications as NotifyIcon, 
  VpnKey as KeyIcon, 
  Info as InfoIcon 
} from '@mui/icons-material';
import { useThemeContext } from './ThemeContext';

export const Settings: React.FC = () => {
  const { darkMode, toggleDarkMode } = useThemeContext();
  
  // Dummy Form states
  const [notifyOnLeave, setNotifyOnLeave] = useState<boolean>(true);
  const [notifyOnAttendance, setNotifyOnAttendance] = useState<boolean>(false);
  const [smtpServer, setSmtpServer] = useState<string>('smtp.enterprise.com');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSaveSMTP = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("System configuration settings successfully saved.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPassword('');
    setNewPassword('');
    setSuccessMsg("User password successfully updated.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Workspace Settings</Typography>
        <Typography variant="body1" color="text.secondary">Configure interface layouts, system email servers, and user security parameters.</Typography>
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 1 }}>{successMsg}</Alert>}

      <Grid container spacing={3}>
        {/* Visual Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="primary" /> Visual & Theme Preferences
            </Typography>
            <Divider />
            <FormControlLabel
              control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
              label="Enable Application Dark Mode Theme"
            />
            <Typography variant="body2" color="text.secondary">
              Selecting this adjusts the background templates into standard slate color pallets to protect eye health during night shifts.
            </Typography>
          </Paper>
        </Grid>

        {/* Notification configurations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotifyIcon color="secondary" /> Automated Email Notifications
            </Typography>
            <Divider />
            <FormControlLabel
              control={<Switch checked={notifyOnLeave} onChange={(e) => setNotifyOnLeave(e.target.checked)} />}
              label="Notify Managers on Staff Leave Requests"
            />
            <FormControlLabel
              control={<Switch checked={notifyOnAttendance} onChange={(e) => setNotifyOnAttendance(e.target.checked)} />}
              label="Notify Employees on Attendance Corrections"
            />
          </Paper>
        </Grid>

        {/* SMTP Mail Server credentials configuration */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }} component="form" onSubmit={handleSaveSMTP}>
            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="info" /> Enterprise Email Configurations
            </Typography>
            <Divider />
            <TextField
              label="Corporate SMTP Mail Server"
              value={smtpServer}
              onChange={(e) => setSmtpServer(e.target.value)}
              fullWidth
            />
            <TextField
              label="Mail Port"
              defaultValue="587"
              disabled
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary" sx={{ alignSelf: 'flex-end', mt: 1 }}>
              Save Mail Server
            </Button>
          </Paper>
        </Grid>

        {/* Change Account Credentials Password */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }} component="form" onSubmit={handleChangePassword}>
            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <KeyIcon color="warning" /> Update Account Password
            </Typography>
            <Divider />
            <TextField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="New Security Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="secondary" 
              sx={{ alignSelf: 'flex-end', mt: 1 }}
              disabled={!currentPassword || !newPassword}
            >
              Update Password
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
