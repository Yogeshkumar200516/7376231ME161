import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Fade,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext.jsx';
import { useThemeMode } from '../../ToggleTheme/ThemeContext.jsx';

const getHomeRoute = (role) => (role === 'hr' ? '/hr/dashboard' : '/notifications');

function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, api } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const isDarkMode = mode === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', {
        email: email.trim(),
        password,
      });

      const { user, token } = response.data.data;
      login(user, token);
      navigate(getHomeRoute(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        background: isDarkMode
          ? 'linear-gradient(135deg, #07111d 0%, #13243b 48%, #1f3552 100%)'
          : 'linear-gradient(135deg, #e9f3ff 0%, #f8fbff 52%, #dcecff 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: isDarkMode
            ? 'radial-gradient(circle at top left, rgba(132,197,255,0.18), transparent 30%), radial-gradient(circle at bottom right, rgba(255,155,84,0.12), transparent 28%)'
            : 'radial-gradient(circle at top left, rgba(11,110,208,0.14), transparent 32%), radial-gradient(circle at bottom right, rgba(249,115,22,0.12), transparent 28%)',
        }}
      />

      <Fade in timeout={500}>
        <IconButton
          onClick={toggleTheme}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            color: isDarkMode ? '#ffffff' : theme.palette.primary.main,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.09)' : 'rgba(11,110,208,0.08)',
            backdropFilter: 'blur(12px)',
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(11,110,208,0.16)',
            },
          }}
          size="large"
        >
          {isDarkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>
      </Fade>

      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 580,
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          backdropFilter: 'blur(18px)',
          background: isDarkMode ? 'rgba(15, 28, 49, 0.78)' : 'rgba(255, 255, 255, 0.84)',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(11,110,208,0.14)'}`,
          boxShadow: isDarkMode
            ? '0 24px 70px rgba(0, 0, 0, 0.34)'
            : '0 24px 70px rgba(43, 96, 164, 0.18)',
        }}
      >
        <Box
  sx={{
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    mb: 2.5,
  }}
>
  <Box
    sx={{
      width: 88,
      height: 88,
      borderRadius: '20px',
      background: `linear-gradient(
        135deg,
        ${theme.palette.primary.main},
        ${theme.palette.secondary.main}
      )`,
      boxShadow: `0 18px 40px ${alpha(
        theme.palette.primary.main,
        0.32
      )}`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <NotificationsActiveRoundedIcon
      sx={{
        color: '#fff',
        fontSize: 42,
        display: 'block',
      }}
    />
  </Box>
</Box>

        <Typography
          variant="h4"
          textAlign="center"
          sx={{ color: 'text.primary', mb: 1, textAlign: 'center' }}
        >
          Campus Notice Hub
        </Typography>
        <Typography
          textAlign="center"
          sx={{ color: 'text.secondary', mb: 4, maxWidth: 420, mx: 'auto', textAlign: 'center' }}
        >
          Sign in as HR or Student to manage broadcast alerts, priority inboxes, and read tracking.
        </Typography>

        <Typography variant="body1" sx={{ mb: 0.75, fontWeight: 600, color: 'text.primary' }}>
          Email <span style={{ color: theme.palette.error.main }}>*</span>
        </Typography>
        <TextField
          fullWidth
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            mb: 2.25,
            '& .MuiOutlinedInput-root': {
              color: 'text.primary',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.92)',
              '& fieldset': {
                borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(22,32,51,0.12)',
              },
              '&:hover fieldset': {
                borderColor: isDarkMode ? 'rgba(255,255,255,0.24)' : 'rgba(22,32,51,0.24)',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MailOutlineRoundedIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="body1" sx={{ mb: 0.75, fontWeight: 600, color: 'text.primary' }}>
          Password <span style={{ color: theme.palette.error.main }}>*</span>
        </Typography>
        <TextField
          fullWidth
          placeholder="Enter your password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            mb: 2.25,
            '& .MuiOutlinedInput-root': {
              color: 'text.primary',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.92)',
              '& fieldset': {
                borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(22,32,51,0.12)',
              },
              '&:hover fieldset': {
                borderColor: isDarkMode ? 'rgba(255,255,255,0.24)' : 'rgba(22,32,51,0.24)',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((current) => !current)}
                  edge="end"
                  sx={{ color: 'text.secondary' }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2.25, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={isSubmitting}
          sx={{
            py: 1.45,
            borderRadius: 2.5,
            fontSize: '1rem',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            boxShadow: `0 18px 30px ${alpha(theme.palette.primary.main, 0.26)}`,
            '&:hover': {
              background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
            },
          }}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </Paper>
    </Box>
  );
}

export default Login;
