import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutlined as ErrorIcon, Home as HomeIcon } from '@mui/icons-material';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Paper sx={{ p: 6, textAlign: 'center', maxWidth: 450, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: 'center' }}>
        <ErrorIcon color="error" sx={{ fontSize: '5rem' }} />
        <Typography variant="h4" sx={{ fontWeight: 800 }}>404 - Page Not Found</Typography>
        <Typography color="text.secondary">
          The requested page route does not exist or you do not have sufficient administrative clearances to view it.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<HomeIcon />} 
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 1, px: 4, py: 1 }}
        >
          Return to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};
