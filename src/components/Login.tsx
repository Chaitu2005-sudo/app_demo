import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, Typography, Paper, TextField, Button, Alert, 
  CircularProgress, Grid, Card, CardActionArea, CardContent, Divider, Avatar
} from '@mui/material';
import { 
  LockOutlined as LockIcon, 
  Security as AdminIcon, 
  People as EmployeeIcon, 
  Engineering as StaffIcon 
} from '@mui/icons-material';
import { useAuth } from './AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setSubmitting(true);
    setAuthError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // Demo shortcut helper
  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password'); // preset default password
  };

  const quickRoles = [
    { title: 'Super Admin', email: 'admin@enterprise.com', icon: <AdminIcon color="error" /> },
    { title: 'HR Manager', email: 'hr@enterprise.com', icon: <EmployeeIcon color="secondary" /> },
    { title: 'Employee', email: 'sarah@enterprise.com', icon: <StaffIcon color="primary" /> }
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: 'background.default' }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1.5 }}>
            <LockIcon />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>EMS Enterprise</Typography>
          <Typography variant="body2" color="text.secondary">Secure Employee Management Portal</Typography>
        </Box>

        {authError && <Alert severity="error">{authError}</Alert>}

        {/* Credentials Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Secure Password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            size="large"
            disabled={submitting}
            sx={{ py: 1.2, fontWeight: 'bold' }}
          >
            {submitting ? <CircularProgress size={24} /> : "Authenticate Login"}
          </Button>
        </Box>

        <Divider sx={{ my: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>DEMO ROLES</Typography>
        </Divider>

        {/* Quick evaluation shortcuts */}
        <Grid container spacing={1.5}>
          {quickRoles.map((role) => (
            <Grid size={{ xs: 4 }} key={role.title}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardActionArea onClick={() => handleQuickLogin(role.email)} sx={{ p: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 0.5 }}>{role.icon}</Box>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', fontSize: '0.65rem' }}>
                    {role.title}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Don't have an account? <Link to="/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
        </Typography>
      </Paper>
    </Box>
  );
};

