import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  Box, AppBar, Toolbar, Drawer, IconButton, Typography, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Divider, Avatar, Badge, Button, useTheme, useMediaQuery, Chip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  People as PeopleIcon, 
  Business as BusinessIcon, 
  AccountCircle as AccountIcon, 
  HistoryToggleOff as LogsIcon, 
  Settings as SettingsIcon, 
  ExitToApp as LogoutIcon, 
  DarkMode as DarkModeIcon, 
  LightMode as LightModeIcon 
} from '@mui/icons-material';
import { motion } from 'motion/react';
import { useAuth } from './AuthContext';
import { useThemeContext } from './ThemeContext';

const DRAWER_WIDTH = 260;

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_EMPLOYEE'] },
    { text: 'Employees', icon: <PeopleIcon />, path: '/employees', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_EMPLOYEE'] },
    { text: 'Departments', icon: <BusinessIcon />, path: '/departments', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_EMPLOYEE'] },
    { text: 'My Profile & Portal', icon: <AccountIcon />, path: '/profile', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_EMPLOYEE'] },
    { text: 'Audit Logs', icon: <LogsIcon />, path: '/audit-logs', roles: ['ROLE_ADMIN'] },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_EMPLOYEE'] }
  ];

  const filteredMenuItems = menuItems.filter(item => user && item.roles.includes(user.role));

  const getRoleColor = (role?: string) => {
    if (role === 'ROLE_ADMIN') return 'error';
    if (role === 'ROLE_HR') return 'secondary';
    return 'primary';
  };

  const getRoleLabel = (role?: string) => {
    if (role === 'ROLE_ADMIN') return 'Administrator';
    if (role === 'ROLE_HR') return 'HR Manager';
    return 'Employee';
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: theme.palette.primary.main, fontWeight: 'bold' }}>EM</Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Enterprise</Typography>
          <Typography variant="body2" color="text.secondary">EMS Workspace</Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '10px',
                  borderLeft: isActive ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                  bgcolor: isActive 
                    ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)')
                    : 'transparent',
                  color: isActive ? 'text.primary' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isActive 
                      ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)')
                      : 'action.hover',
                  },
                  px: 2,
                  py: 1,
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontWeight: isActive ? 600 : 500, fontSize: '0.9rem' }}>{item.text}</Typography>} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      {/* Drawer Footer User Profile Overview */}
      {user && (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
              {user.email.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>{user.email}</Typography>
              <Chip 
                label={getRoleLabel(user.role)} 
                size="small" 
                color={getRoleColor(user.role)} 
                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 'bold', mt: 0.5 }} 
              />
            </Box>
          </Box>
          <Button 
            variant="outlined" 
            color="inherit" 
            size="small" 
            startIcon={<LogoutIcon />} 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            fullWidth
            sx={{ borderRadius: 2 }}
          >
            Logout
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header Top Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
              {menuItems.find(item => location.pathname.startsWith(item.path))?.text || 'Employee Management'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={toggleDarkMode} color="inherit" title="Toggle theme">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton 
              onClick={() => {
                logout();
                navigate('/login');
              }} 
              color="inherit" 
              title="Logout"
              sx={{ ml: 0.5 }}
            >
              <LogoutIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, ml: 1 }}>
              Local System Time: 2026-07-04
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawers */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.55)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Desktop permanent drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.55)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRight: '1px solid', 
              borderColor: 'divider' 
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main page view containers */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default'
        }}
      >
        <Toolbar /> {/* Top Bar spacer */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
          >
            <Outlet />
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};
