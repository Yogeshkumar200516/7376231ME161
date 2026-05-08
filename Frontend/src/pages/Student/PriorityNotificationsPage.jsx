import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import PageSection from '../shared/PageSection.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const typeOptions = ['All', 'Placement', 'Result', 'Event'];

function PriorityNotificationsPage() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [type, setType] = useState('All');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPriority = async () => {
      setLoading(true);
      setError('');

      try {
        const params = { n: count };
        if (type !== 'All') {
          params.notification_type = type;
        }

        const response = await api.get('/api/notifications/priority', { params });
        setItems(response.data.data.notifications || []);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Unable to load priority notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchPriority();
  }, [api, count, type]);

  return (
    <PageSection
      eyebrow="Priority Inbox"
      title="Top unread notifications"
      subtitle="Ranked by notification weight and recency so placement updates surface first."
      action={
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={type} onChange={(event) => setType(event.target.value)}>
              {typeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      }
    >
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom sx={{ fontWeight: 600 }}>
          Top {count} notifications
        </Typography>
        <Slider
          value={count}
          onChange={(_event, value) => setCount(value)}
          step={5}
          marks
          min={5}
          max={20}
          valueLabelDisplay="auto"
        />
      </Box>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {items.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.default',
              }}
            >
              <Stack spacing={1.1}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                  <Chip label={`#${index + 1}`} color="secondary" />
                  <Chip label={item.type} color="primary" variant="outlined" />
                  <Chip label={`Weight ${item.weight}`} variant="outlined" />
                </Stack>
                <Typography variant="h6">{item.message}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Created {new Date(item.timestamp).toLocaleString()} • Score {item.priority_score}
                </Typography>
              </Stack>
            </Box>
          ))}

          {!items.length ? <Alert severity="info">No unread priority notifications found.</Alert> : null}
        </Stack>
      )}
    </PageSection>
  );
}

export default PriorityNotificationsPage;
