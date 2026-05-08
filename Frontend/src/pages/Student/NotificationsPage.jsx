import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  Pagination,
  MenuItem,
  Select,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { Link as RouterLink } from 'react-router-dom';
import PageSection from '../shared/PageSection.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const typeOptions = ['All', 'Placement', 'Result', 'Event'];

function NotificationsPage() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [type, setType] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');

    try {
      const params = { page, limit: 8 };
      if (type !== 'All') {
        params.notification_type = type;
      }

      const response = await api.get('/api/notifications', { params });
      const payload = response.data.data;
      setItems(payload.notifications || []);
      setTotalPages(payload.pagination?.totalPages || 1);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, type]);

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      fetchNotifications();
    } catch (markError) {
      setError(markError.response?.data?.message || 'Unable to mark notifications as read.');
    }
  };

  return (
    <PageSection
      eyebrow="Feed"
      title="All notifications"
      subtitle="Review your paginated feed, filter by notification type, and spot unread items instantly."
      action={
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={type}
              onChange={(event) => {
                setPage(1);
                setType(event.target.value);
              }}
            >
              {typeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={markAllAsRead}>
            Mark All Read
          </Button>
        </Stack>
      }
    >
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: '1px solid',
                borderColor: item.is_read ? 'divider' : 'primary.main',
                backgroundColor: item.is_read ? 'background.default' : 'action.hover',
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                <Box>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.25 }}>
                    <Chip label={item.type} size="small" color="primary" />
                    <Chip
                      label={item.is_read ? 'Read' : 'New'}
                      size="small"
                      color={item.is_read ? 'default' : 'secondary'}
                      variant={item.is_read ? 'outlined' : 'filled'}
                    />
                  </Stack>
                  <Typography variant="h6" sx={{ mb: 0.75 }}>
                    {item.message}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Delivered {new Date(item.delivered_at || item.timestamp).toLocaleString()}
                  </Typography>
                </Box>

                <Button
                  component={RouterLink}
                  to={`/notifications/${item.id}`}
                  variant="outlined"
                  startIcon={<VisibilityRoundedIcon />}
                  sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
                >
                  Open
                </Button>
              </Stack>
            </Box>
          ))}

          {!items.length ? <Alert severity="info">No notifications available.</Alert> : null}
        </Stack>
      )}

      {totalPages > 1 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_event, value) => setPage(value)} color="primary" />
        </Box>
      ) : null}
    </PageSection>
  );
}

export default NotificationsPage;
