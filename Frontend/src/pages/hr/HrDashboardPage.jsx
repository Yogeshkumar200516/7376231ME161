import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PageSection from '../shared/PageSection.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const notificationTypes = ['Placement', 'Result', 'Event'];

function HrDashboardPage() {
  const { api } = useAuth();
  const [students, setStudents] = useState([]);
  const [notificationType, setNotificationType] = useState('Placement');
  const [message, setMessage] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/hr/students');
        setStudents(response.data.data.students || []);
      } catch (error) {
        setFeedback({
          type: 'error',
          message: error.response?.data?.message || 'Unable to load students.',
        });
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [api]);

  const selectedLabel = useMemo(() => {
    if (selectedStudents.length === 0) {
      return 'No students selected';
    }

    if (selectedStudents.length === students.length) {
      return 'All students selected';
    }

    return `${selectedStudents.length} student(s) selected`;
  }, [selectedStudents.length, students.length]);

  const submitNotification = async (mode) => {
    if (!message.trim()) {
      setFeedback({ type: 'error', message: 'Message is required.' });
      return;
    }

    if (mode === 'selected' && selectedStudents.length === 0) {
      setFeedback({ type: 'error', message: 'Select at least one student.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        notification_type: notificationType,
        message: message.trim(),
      };

      const response =
        mode === 'all'
          ? await api.post('/api/hr/notify-all', payload)
          : await api.post('/api/hr/notify-selected', {
              ...payload,
              student_ids: selectedStudents,
            });

      setFeedback({
        type: 'success',
        message: response.data.message || 'Notification queued successfully.',
      });
      setMessage('');
      if (mode === 'selected') {
        setSelectedStudents([]);
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Unable to queue notification.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <PageSection
        eyebrow="HR Console"
        title="Compose and send notifications"
        subtitle="Broadcast to every student or target selected students with the same publish flow."
      >
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel id="notification-type-label">Notification Type</InputLabel>
              <Select
                labelId="notification-type-label"
                value={notificationType}
                label="Notification Type"
                onChange={(event) => setNotificationType(event.target.value)}
              >
                {notificationTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Notification Message"
              placeholder="Write the campus update that should be sent to students."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel id="student-select-label">Select Students</InputLabel>
              <Select
                labelId="student-select-label"
                multiple
                value={selectedStudents}
                onChange={(event) => setSelectedStudents(event.target.value)}
                input={<OutlinedInput label="Select Students" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {selected.slice(0, 3).map((studentId) => {
                      const student = students.find((item) => item.id === studentId);
                      return <Chip key={studentId} label={student?.name || studentId} />;
                    })}
                    {selected.length > 3 ? <Chip label={`+${selected.length - 3} more`} /> : null}
                  </Box>
                )}
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Button
                variant="contained"
                startIcon={<GroupsRoundedIcon />}
                onClick={() => submitNotification('all')}
                disabled={submitting || loadingStudents}
              >
                Notify All
              </Button>
              <Button
                variant="outlined"
                startIcon={<SendRoundedIcon />}
                onClick={() => submitNotification('selected')}
                disabled={submitting || loadingStudents}
              >
                Notify Selected
              </Button>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {selectedLabel}
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {feedback ? (
          <Alert severity={feedback.type} sx={{ mt: 3, borderRadius: 3 }}>
            {feedback.message}
          </Alert>
        ) : null}
      </PageSection>

      <PageSection
        eyebrow="Audience"
        title="Active student list"
        subtitle="Use this list to review the current recipients available for targeted messages."
      >
        {loadingStudents ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {students.map((student) => (
              <ListItem
                key={student.id}
                divider
                secondaryAction={<Chip label="Active" color="success" variant="outlined" size="small" />}
                sx={{ px: 0 }}
              >
                <ListItemText
                  primary={student.name}
                  secondary={
                    <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                      {student.email}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </PageSection>
    </Stack>
  );
}

export default HrDashboardPage;
