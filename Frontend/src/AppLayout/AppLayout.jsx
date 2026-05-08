import { Box, CircularProgress } from '@mui/material';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar.jsx';
import Login from '../components/Login/Login.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import RoleHomeRedirect from '../pages/shared/RoleHomeRedirect.jsx';
import HrDashboardPage from '../pages/hr/HrDashboardPage.jsx';
import HrHistoryPage from '../pages/hr/HrHistoryPage.jsx';
import HrUsersPage from '../pages/hr/HrUsersPage.jsx';
import NotificationsPage from '../pages/student/NotificationsPage.jsx';
import PriorityNotificationsPage from '../pages/student/PriorityNotificationsPage.jsx';
import NotificationDetailPage from '../pages/student/NotificationDetailPage.jsx';

function AppShell() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - 272px)` },
          mt: { xs: 8, md: 0 },
          p: { xs: 2, sm: 3 },
          pt: { xs: 11, md: 12 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'hr' ? '/hr/dashboard' : '/notifications'} replace />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user.role === 'hr' ? '/hr/dashboard' : '/notifications'} replace />;
  }

  return <Login />;
}

function AppLayout() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<RoleHomeRedirect />} />

          <Route element={<ProtectedRoute allowedRoles={['hr']} />}>
            <Route path="/hr/dashboard" element={<HrDashboardPage />} />
            <Route path="/hr/users" element={<HrUsersPage />} />
            <Route path="/hr/history" element={<HrHistoryPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/notifications/priority" element={<PriorityNotificationsPage />} />
            <Route path="/notifications/:id" element={<NotificationDetailPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppLayout;
