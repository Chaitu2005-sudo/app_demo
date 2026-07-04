import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, CircularProgress, 
  Avatar, ListItemIcon, ListItemText, TextField 
} from '@mui/material';
import { 
  HistoryToggleOff as LogsIcon, 
  Search as SearchIcon,
  Shield as ShieldIcon 
} from '@mui/icons-material';
import { AuditLog } from '../types';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/api/audit-logs');
        setLogs(res.data);
      } catch (e) {
        console.error("Could not fetch audit logs", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('FAIL')) return 'error';
    if (action.includes('SUCCESS') || action.includes('CREATE')) return 'success';
    if (action.includes('UPDATE')) return 'info';
    return 'default';
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.executedBy.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>System Audit Trail</Typography>
          <Typography variant="body1" color="text.secondary">Real-time immutable ledger of user sessions, CRUD operations, and credential modifications.</Typography>
        </Box>
        <Chip label="GDPR Compliant" color="primary" size="small" icon={<ShieldIcon />} sx={{ fontWeight: 'bold' }} />
      </Box>

      {/* Search Input filter */}
      <Paper sx={{ p: 2 }}>
        <TextField
          label="Filter System Logs"
          placeholder="Search by initiator, action type, or details..."
          variant="outlined"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }
          }}
        />
      </Paper>

      {/* Main Ledger Table */}
      <TableContainer component={Paper} sx={{ flex: 1, minHeight: 400 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Log ID</TableCell>
                <TableCell>Executed Action</TableCell>
                <TableCell>Details / Context</TableCell>
                <TableCell>Executed By</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>#00{log.id}</TableCell>
                    <TableCell>
                      <Chip 
                        label={log.action} 
                        size="small" 
                        color={getActionColor(log.action)} 
                        sx={{ fontWeight: 'bold', fontSize: '0.65rem' }} 
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 350 }}>{log.details}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{log.executedBy}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.ipAddress}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No matching ledger records found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
};
