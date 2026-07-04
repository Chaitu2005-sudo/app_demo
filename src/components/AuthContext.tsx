import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User, Employee } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  employeeProfile: Employee | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [employeeProfile, setEmployeeProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser) as User;
      setToken(savedToken);
      setUser(parsedUser);
      // Set axios default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      
      // Fetch associated employee profile if employee logs in
      fetchEmployeeProfile(parsedUser.email, savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchEmployeeProfile = async (email: string, activeToken: string) => {
    try {
      const res = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${activeToken}` },
        params: { search: email }
      });
      if (res.data && res.data.content && res.data.content.length > 0) {
        setEmployeeProfile(res.data.content[0]);
      }
    } catch (e) {
      console.error("Could not fetch employee profile", e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, id, role } = res.data;
      
      const loggedUser: User = { id, email, role };
      setToken(token);
      setUser(loggedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      await fetchEmployeeProfile(email, token);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (email: string, password: string, role: string) => {
    setError(null);
    try {
      await axios.post('/api/auth/register', { email, password, role });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setEmployeeProfile(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      employeeProfile,
      isAuthenticated,
      login,
      register,
      logout,
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
