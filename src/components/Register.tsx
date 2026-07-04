import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, Typography, Paper, TextField, Button, Alert, 
  CircularProgress, MenuItem, Avatar 
} from '@mui/material';
import { AppRegistration as RegisterIcon } from '@mui/icons-material';
import { useAuth } from './AuthContext';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>('EMPLOYEE');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await register(email, password, role);
      setSuccessMsg("Account successfully registered! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Ensure email is unique.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: 'background.default' }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        
        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1.5 }}>
            <RegisterIcon />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Create Corporate Account</Typography>
          <Typography variant="body2" color="text.secondary">Register administrative, HR, or staff access profiles</Typography>
        </Box>

        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {successMsg && <Alert severity="success">{successMsg}</Alert>}

        {/* Inputs Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Corporate Email Address"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password (min 6 characters)"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{ htmlInput: { minLength: 6 } }}
          />
          <TextField
            select
            label="Account Classification Role"
            fullWidth
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="EMPLOYEE">Staff Employee</MenuItem>
            <MenuItem value="HR">HR Manager</MenuItem>
            <MenuItem value="ADMIN">Super Administrator</MenuItem>
          </TextField>

          <Button 
            type="submit" 
            variant="contained" 
            color="secondary" 
            size="large"
            disabled={submitting}
            sx={{ py: 1.2, fontWeight: 'bold' }}
          >
            {submitting ? <CircularProgress size={24} /> : "Register Credentials"}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Already have an account? <Link to="/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Log in here</Link>
        </Typography>
      </Paper>
    </Box>
  );
};
