import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    const body = document.body;
    if (darkMode) {
      body.classList.remove('mesh-bg-light');
      body.classList.add('mesh-bg-dark');
    } else {
      body.classList.remove('mesh-bg-dark');
      body.classList.add('mesh-bg-light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#0284c7', // Sky-forward modern Blue
        light: '#38bdf8',
        dark: '#0369a1',
      },
      secondary: {
        main: '#10b981', // Emerald green from design
        light: '#34d399',
        dark: '#047857',
      },
      background: {
        default: 'transparent', // Let body's mesh backdrop show through
        paper: darkMode ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.45)',
      },
      text: {
        primary: darkMode ? '#f8fafc' : '#0f172a',
        secondary: darkMode ? '#94a3b8' : '#475569',
      },
      divider: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.025em' },
      h2: { fontWeight: 700, letterSpacing: '-0.021em' },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(30, 41, 59, 0.45)' 
              : 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(255, 255, 255, 0.45)',
            borderRadius: '16px',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.25)'
              : '0 8px 32px 0 rgba(31, 38, 135, 0.06)',
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(30, 41, 59, 0.45)' 
              : 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(255, 255, 255, 0.45)',
            borderRadius: '16px',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.25)'
              : '0 8px 32px 0 rgba(31, 38, 135, 0.06)',
          }),
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(15, 23, 42, 0.85)'
              : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: '16px',
          }),
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderBottom: theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.06)'
              : '1px solid rgba(15, 23, 42, 0.06)',
          }),
          head: ({ theme }) => ({
            fontWeight: 600,
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.02)'
              : 'rgba(0, 0, 0, 0.02)',
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: '10px',
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(0, 0, 0, 0.02)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
            },
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
            padding: '8px 16px',
          },
        },
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: ({ theme }: { theme: any }) => ({
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 4px 14px rgba(2, 132, 199, 0.4)'
                : '0 4px 14px rgba(2, 132, 199, 0.2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 18px rgba(2, 132, 199, 0.5)'
                  : '0 4px 18px rgba(2, 132, 199, 0.3)',
              }
            })
          },
          {
            props: { variant: 'contained', color: 'secondary' },
            style: ({ theme }: { theme: any }) => ({
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 4px 14px rgba(16, 185, 129, 0.4)'
                : '0 4px 14px rgba(16, 185, 129, 0.2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 18px rgba(16, 185, 129, 0.5)'
                  : '0 4px 18px rgba(16, 185, 129, 0.3)',
              }
            })
          }
        ]
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
};
