import { useMemo, useState } from 'react';
import {
  AppBar,
  Badge,
  Box,
  Button,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import { useAuth } from '../../context/AuthContext.jsx';
import { useThemeMode } from '../../ToggleTheme/ThemeContext.jsx';

const drawerWidth = 272;

const navItemsByRole = {
  hr: [
    { text: 'HR Dashboard', icon: <DashboardRoundedIcon />, path: '/hr/dashboard' },
    { text: 'Users', icon: <GroupAddRoundedIcon />, path: '/hr/users' },
    { text: 'History', icon: <HistoryRoundedIcon />, path: '/hr/history' },
  ],
  student: [
    { text: 'Notifications', icon: <NotificationsRoundedIcon />, path: '/notifications' },
    { text: 'Priority Inbox', icon: <PriorityHighRoundedIcon />, path: '/notifications/priority' },
  ],
};

function Navbar() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(() => navItemsByRole[user?.role] || [], [user?.role]);
  const showBadge = user?.role === 'student';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: isDark
          ? 'linear-gradient(180deg, rgba(132,197,255,0.08), transparent 22%)'
          : 'linear-gradient(180deg, rgba(11,110,208,0.08), transparent 24%)',
      }}
    >
      <Box sx={{ px: 2.5, py: 3, justifyContent: 'center' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3.5,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            placeItems: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: `0 16px 28px ${alpha(theme.palette.primary.main, 0.22)}`,
            mb: 2,
          }}
        >
          <CampaignRoundedIcon sx={{ color: '#fff', fontSize: 30, justifyContent: 'center' }} />
        </Box>
        <Typography variant="h6" sx={{ color: 'text.primary', textAlign: 'center' }}>
          Campus Notice Hub
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, textAlign: 'center' }}>
          {user?.role === 'hr' ? 'HR broadcasting workspace' : 'Student notification center'}
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/notifications' && location.pathname.startsWith(item.path));

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.75 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 3,
                  minHeight: 50,
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, isDark ? 0.22 : 0.12)
                    : 'transparent',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.08),
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 600,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutRoundedIcon />}
          onClick={handleLogout}
          sx={{ borderRadius: 3, py: 1.2 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: alpha(theme.palette.background.paper, 0.76),
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          color: 'text.primary',
          p: 1,
        }}
      >
        <Toolbar sx={{ minHeight: 76, gap: 1.5 }}>
          {isMobile && (
            <IconButton color="inherit" onClick={() => setMobileOpen(true)} edge="start">
              <MenuRoundedIcon />
            </IconButton>
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              {user?.role === 'hr' ? 'HR Notifications' : 'Student Notifications'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {user?.name ? `Welcome back, ${user.name}` : 'Manage campus updates'}
            </Typography>
          </Box>

          {showBadge && (
            <Tooltip title="Unread count is available inside your feed">
              <IconButton
                sx={{
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }}
              >
                <Badge color="error" variant="dot">
                  <MarkEmailUnreadRoundedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              }}
            >
              {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 1.25,
              px: 1.6,
              py: 0.5,
              borderRadius: 999,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                p: 1,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: '#fff',
                fontWeight: 700,
              }}
            >
              {(user?.name?.[0] || user?.role?.[0] || 'U').toUpperCase()}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                {user?.role === 'hr' ? 'HR / Admin' : 'Student'}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              backgroundColor: theme.palette.background.paper,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
    </>
  );
}

export default Navbar;
