import { createContext, useContext, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { darkTheme, lightTheme } from './ToggleTheme.jsx';

const ThemeContext = createContext(null);

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(localStorage.getItem('notification_theme') || 'light');

  const toggleTheme = () => {
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    localStorage.setItem('notification_theme', nextMode);
    setMode(nextMode);
  };

  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);
  const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }

  return context;
};
