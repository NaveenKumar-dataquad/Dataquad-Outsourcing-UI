import React from 'react';
import {
  Box,
  Typography,
  Chip,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';

const ScheduledInterviewsTab = ({ tabValue, interview_Scheduled_Candidates }) => {
  const theme = useTheme();

  const scheduledInterviewHeaders = [
    'candidateId',
    'candidateName',
    'email',
    'interviewDateTime',
    'interviewLevel',
    'interviewStatus',
  ];

  const formatHeaderText = (header) => {
    return header
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const formatDateAndTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const formattedDate = date.toLocaleDateString(undefined, dateOptions);
    const formattedTime = date.toLocaleTimeString(undefined, timeOptions);
    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <Box
      role="tabpanel"
      hidden={tabValue !== 2}
      id="job-details-tabpanel-2"
      aria-labelledby="job-details-tab-2"
    >
      {tabValue === 2 && (
        <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {Object.keys(interview_Scheduled_Candidates).length > 0 ? (
            Object.entries(interview_Scheduled_Candidates).map(
              ([recruiterId, candidates]) => (
                <Box key={recruiterId} mb={4}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      pb: 1,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <EventIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Recruiter: {recruiterId}
                    </Typography>
                    <Chip
                      label={`${candidates.length} Interview${
                        candidates.length !== 1 ? 's' : ''
                      }`}
                      size="small"
                      sx={{
                        ml: 2,
                        bgcolor: theme.palette.success.light,
                        color: theme.palette.success.contrastText,
                      }}
                    />
                  </Box>

                  {Array.isArray(candidates) && candidates.length > 0 ? (
                    <TableContainer
                      component={Paper}
                      elevation={2}
                      sx={{
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow
                            sx={{
                              bgcolor: theme.palette.success.light,
                            }}
                          >
                            {scheduledInterviewHeaders.map((header) => (
                              <TableCell
                                key={header}
                                sx={{
                                  fontWeight: 'bold',
                                  color: theme.palette.success.contrastText,
                                  py: 1.5,
                                }}
                              >
                                {formatHeaderText(header)}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {candidates.map((candidate, idx) => (
                            <TableRow
                              key={candidate.candidateId || `interview-${idx}`}
                              sx={{
                                '&:nth-of-type(odd)': {
                                  bgcolor: theme.palette.action.hover,
                                },
                                '&:hover': {
                                  bgcolor: theme.palette.action.selected,
                                },
                              }}
                            >
                              {scheduledInterviewHeaders.map((header) => (
                                <TableCell
                                  key={`${candidate.candidateId || idx}-${header}`}
                                  sx={{
                                    py: 1.5,
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                  }}
                                >
                                  {header === 'email' &&
                                  candidate[header]?.includes('@') ? (
                                    <a
                                      href={
                                        candidate[header].startsWith('mailto:')
                                          ? candidate[header]
                                          : `mailto:${candidate[header]}`
                                      }
                                      style={{
                                        textDecoration: 'none',
                                        color: theme.palette.success.dark,
                                        fontWeight: 500,
                                      }}
                                    >
                                      {candidate[header].replace('mailto:', '')}
                                    </a>
                                  ) : header === 'interviewDateTime' ? (
                                    formatDateAndTime(candidate[header])
                                  ) : (
                                    candidate[header] || 'N/A'
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Typography color="textSecondary">
                        No scheduled interviews for this recruiter
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )
            )
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 200,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: `1px dashed ${theme.palette.divider}`,
              }}
            >
              <Typography color="textSecondary">
                No scheduled interviews available.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ScheduledInterviewsTab;