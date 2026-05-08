import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import PageSection from '../shared/PageSection.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const typeOptions = ['All', 'Placement', 'Result', 'Event'];

function HrHistoryPage() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [type, setType] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');

      try {
        const params = { page, limit: 8 };
        if (type !== 'All') {
          params.notification_type = type;
        }

        const response = await api.get('/api/hr/history', { params });
        const payload = response.data.data;
        setItems(payload.notifications || []);
        setTotalPages(payload.pagination?.totalPages || 1);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Unable to load history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [api, page, type]);

  return (
    <PageSection
      eyebrow="History"
      title="Sent notifications and delivery status"
      subtitle="Track how many delivery attempts are pending, sent, or failed for every HR broadcast."
      action={
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="hr-history-filter">Type</InputLabel>
          <Select
            labelId="hr-history-filter"
            value={type}
            label="Type"
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
                borderColor: 'divider',
                backgroundColor: 'background.default',
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.25 }}>
                    <Chip label={item.type} color="primary" size="small" />
                    <Chip label={`${item.total_recipients} recipients`} variant="outlined" size="small" />
                  </Stack>
                  <Typography variant="h6" sx={{ mb: 0.75 }}>
                    {item.message}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Sent on {new Date(item.created_at).toLocaleString()}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                    <Chip label={`Pending: ${item.pending_count}`} color="warning" variant="outlined" />
                    <Chip label={`Sent: ${item.sent_count}`} color="success" variant="outlined" />
                    <Chip label={`Failed: ${item.failed_count}`} color="error" variant="outlined" />
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          ))}

          {!items.length ? (
            <Alert severity="info">No notifications found for the selected filter.</Alert>
          ) : null}
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

export default HrHistoryPage;
