import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import PageSection from '../shared/PageSection.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function HrUsersPage() {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const response = await api.get('/api/hr/users');
      setUsers(response.data.data.users || []);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Unable to load users.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFeedback({
        type: 'error',
        message: 'Name, email, and password are required.',
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await api.post('/api/hr/users', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      setFeedback({
        type: 'success',
        message: response.data.message || 'User created successfully.',
      });
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'student',
      });
      fetchUsers();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Unable to create user.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <PageSection
        eyebrow="User Management"
        title="Add users into the system"
        subtitle="Create HR or Student accounts directly from the admin workspace."
      >
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={form.name}
              onChange={handleChange('name')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Password"
              type="text"
              value={form.password}
              onChange={handleChange('password')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="user-role-label">Role</InputLabel>
              <Select
                labelId="user-role-label"
                label="Role"
                value={form.role}
                onChange={handleChange('role')}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="hr">HR / Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              startIcon={<PersonAddAltRoundedIcon />}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Creating User...' : 'Create User'}
            </Button>
          </Grid>
        </Grid>

        {feedback ? (
          <Alert severity={feedback.type} sx={{ mt: 3, borderRadius: 3 }}>
            {feedback.message}
          </Alert>
        ) : null}
      </PageSection>

      <PageSection
        eyebrow="Directory"
        title="Current users"
        subtitle="Review all registered HR and Student accounts from one place."
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {users.map((user) => (
              <Box
                key={user.id}
                sx={{
                  p: 2.25,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.default',
                }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  spacing={1.5}
                >
                  <Box>
                    <Typography variant="h6">{user.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      {user.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      Created on {new Date(user.created_at).toLocaleString()}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip
                      label={user.role === 'hr' ? 'HR / Admin' : 'Student'}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={user.is_active ? 'Active' : 'Inactive'}
                      color={user.is_active ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </Box>
            ))}

            {!users.length ? <Alert severity="info">No users found in the system yet.</Alert> : null}
          </Stack>
        )}
      </PageSection>
    </Stack>
  );
}

export default HrUsersPage;
