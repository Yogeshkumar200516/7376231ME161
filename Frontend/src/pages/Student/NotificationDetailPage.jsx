import { useEffect, useState } from 'react';
import { Alert, Box, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import PageSection from '../shared/PageSection.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function NotificationDetailPage() {
  const { id } = useParams();
  const { api } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/api/notifications/${id}`);
        setItem(response.data.data.notification);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Unable to load notification detail.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [api, id]);

  return (
    <PageSection
      eyebrow="Detail"
      title="Notification detail"
      subtitle="Opening this page marks the notification as read automatically."
    >
      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : item ? (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={item.type} color="primary" />
            <Chip label={item.is_read ? 'Read' : 'Unread'} variant="outlined" />
          </Stack>
          <Typography variant="h4">{item.message}</Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Created on {new Date(item.timestamp).toLocaleString()}
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Read on {item.read_at ? new Date(item.read_at).toLocaleString() : 'Just now'}
          </Typography>
        </Stack>
      ) : null}
    </PageSection>
  );
}

export default NotificationDetailPage;
