import { createTheme } from '@mui/material/styles';

const sharedShape = {
  borderRadius: 10,
};

const sharedTypography = {
  fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
  h3: {
    fontWeight: 700,
    letterSpacing: '-0.03em',
  },
  h4: {
    fontWeight: 700,
    letterSpacing: '-0.03em',
  },
  h5: {
    fontWeight: 700,
  },
  h6: {
    fontWeight: 700,
  },
  button: {
    fontWeight: 700,
    textTransform: 'none',
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0b6ed0',
      light: '#4ba3ff',
      dark: '#084f96',
    },
    secondary: {
      main: '#f97316',
    },
    background: {
      default: '#eef4fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#162033',
      secondary: '#596579',
    },
    success: {
      main: '#0f9d58',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#dc2626',
    },
  },
  shape: sharedShape,
  typography: sharedTypography,
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#84c5ff',
      light: '#b4ddff',
      dark: '#4d95cf',
    },
    secondary: {
      main: '#ff9b54',
    },
    background: {
      default: '#08111f',
      paper: '#0f1c31',
    },
    text: {
      primary: '#f5f7fb',
      secondary: '#b3bfd1',
    },
    success: {
      main: '#58d68d',
    },
    warning: {
      main: '#fbbf24',
    },
    error: {
      main: '#f87171',
    },
  },
  shape: sharedShape,
  typography: sharedTypography,
});
