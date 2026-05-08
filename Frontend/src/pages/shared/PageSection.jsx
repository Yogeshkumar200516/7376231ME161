import { Box, Paper, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

function PageSection({ eyebrow, title, subtitle, action, children }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.25, md: 3 },
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
        background: alpha(theme.palette.background.paper, 0.88),
        backdropFilter: 'blur(14px)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          {eyebrow ? (
            <Typography
              variant="caption"
              sx={{
                color: 'primary.main',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {eyebrow}
            </Typography>
          ) : null}
          <Typography variant="h5" sx={{ mt: 0.5 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography sx={{ color: 'text.secondary', mt: 0.75 }}>{subtitle}</Typography>
          ) : null}
        </Box>
        {action}
      </Box>
      {children}
    </Paper>
  );
}

export default PageSection;
