import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeContextProvider } from './components/ThemeContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeDetails } from './components/EmployeeDetails';
import { EmployeeForm } from './components/EmployeeForm';
import { Departments } from './components/Departments';
import { Profile } from './components/Profile';
import { AuditLogs } from './components/AuditLogs';
import { Settings } from './components/Settings';
import { NotFound } from './components/NotFound';
import { Box, CircularProgress } from '@mui/material';

// Guard for routing paths
const AuthGuard: React.FC<{ children: React.ReactNode; requiredRole?: string[] }> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default' }}>
        <CircularProgress size={45} />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Route redirection if user is already authenticated
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default' }}>
        <CircularProgress size={45} />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />

            {/* Authenticated layout routes */}
            <Route 
              path="/" 
              element={
                <AuthGuard>
                  <Layout />
                </AuthGuard>
              }
            >
              {/* Default redirects to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              <Route path="dashboard" element={<Dashboard />} />
              
              <Route path="employees" element={<EmployeeList />} />
              <Route path="employees/:id" element={<EmployeeDetails />} />
              <Route path="employees/add" element={<EmployeeForm />} />
              <Route path="employees/edit/:id" element={<EmployeeForm />} />
              
              <Route path="departments" element={<Departments />} />
              
              <Route path="profile" element={<Profile />} />
              
              <Route 
                path="audit-logs" 
                element={
                  <AuthGuard requiredRole={['ROLE_ADMIN']}>
                    <AuditLogs />
                  </AuthGuard>
                } 
              />
              
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeContextProvider>
  );
}
