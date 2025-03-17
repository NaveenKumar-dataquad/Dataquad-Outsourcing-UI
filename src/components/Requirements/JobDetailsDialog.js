import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../redux/config";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`job-details-tabpanel-${index}`}
      aria-labelledby={`job-details-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const formatHeaderText = (header) => {
  return header
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/Id$/, " ID")
    .replace(/([a-z])([A-Z])/g, "$1 $2");
};

const JobDetailsDialog = ({ open, handleClose, jobId }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [jobData, setJobData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (jobId && open) {
        setIsLoading(true);
        setDataError(null);
        try {
          const response = await axios.get(
            `${BASE_URL}/requirements/${jobId}`
          );
          if (response.status === 200) {
            setJobData(response.data);
          } else {
            setDataError(`Unexpected response status: ${response.status}`);
          }
        } catch (error) {
          console.error("Error fetching job details:", error);
          setDataError(`Error fetching job details: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      } else {
        setJobData(null);
      }
    };

    fetchData();
  }, [jobId, open]);

  const generateTableHeaders = (dataObject) => {
    if (!dataObject || Object.keys(dataObject).length === 0) return [];

    for (const recruiterId in dataObject) {
      const candidates = dataObject[recruiterId];
      if (Array.isArray(candidates) && candidates.length > 0) {
        // Found a recruiter with candidates, use the first candidate for headers
        const firstCandidate = candidates[0];
        return Object.keys(firstCandidate);
      }
    }

    // No candidates found for any recruiter
    return [];
  };

  const submittedCandidateHeaders = jobData
    ? generateTableHeaders(jobData.submitted_Candidates)
    : [];
  const scheduledInterviewHeaders = jobData
    ? generateTableHeaders(jobData.interview_Scheduled_Candidates)
    : [];

  // Loading state
  if (isLoading) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
            py: 6,
          }}
        >
          <CircularProgress color="primary" size={60} thickness={4} />
          <Typography variant="body1" sx={{ mt: 3, color: "text.secondary" }}>
            Loading job details...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (dataError) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: "error.light", py: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" color="error.dark">
              Job Details - {jobId}
            </Typography>
            <IconButton
              edge="end"
              color="error"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Alert severity="error" variant="filled" sx={{ mb: 3 }}>
            {dataError}
          </Alert>
          {jobData && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2">Data received:</Typography>
              <Paper
                variant="outlined"
                sx={{
                  mt: 1,
                  p: 2,
                  bgcolor: "grey.50",
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(jobData, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  if (!jobData) {
    return null;
  }

  const { recruiters, submitted_Candidates, interview_Scheduled_Candidates } =
    jobData;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.light,
          color: theme.palette.primary.contrastText,
          py: 2,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Job Details - {jobId}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.3)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="job details tabs"
        textColor="primary"
        indicatorColor="primary"
        variant="fullWidth"
        sx={{
          bgcolor: theme.palette.background.paper,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            py: 2,
            fontWeight: "medium",
          },
        }}
      >
        <Tab
          icon={<InfoIcon fontSize="small" />}
          iconPosition="start"
          label="Full Job Details"
          id="job-details-tab-0"
          aria-controls="job-details-tabpanel-0"
        />
        <Tab
          icon={<PersonIcon fontSize="small" />}
          iconPosition="start"
          label="Recruiters"
          id="job-details-tab-0"
          aria-controls="job-details-tabpanel-0"
        />
        <Tab
          icon={<AssignmentIcon fontSize="small" />}
          iconPosition="start"
          label="Submitted Candidates"
          id="job-details-tab-1"
          aria-controls="job-details-tabpanel-1"
        />
        <Tab
          icon={<EventIcon fontSize="small" />}
          iconPosition="start"
          label="Scheduled Interviews"
          id="job-details-tab-2"
          aria-controls="job-details-tabpanel-2"
        />
      </Tabs>

      <DialogContent dividers sx={{ p: 3, bgcolor: theme.palette.grey[50] }}>
        <TabPanel value={tabValue} index={0}>
          {Array.isArray(recruiters) && recruiters.length > 0 ? (
            <TableContainer
              component={Paper}
              elevation={2}
              sx={{
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.primary.light }}>
                    {Object.keys(recruiters[0]).map((key) => (
                      <TableCell
                        key={key}
                        sx={{
                          fontWeight: "bold",
                          color: theme.palette.primary.contrastText,
                          py: 1.5,
                        }}
                      >
                        {formatHeaderText(key)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recruiters.map((recruiter, index) => (
                    <TableRow
                      key={recruiter.recruiterId || index}
                      sx={{
                        "&:nth-of-type(odd)": {
                          bgcolor: theme.palette.action.hover,
                        },
                        "&:hover": {
                          bgcolor: theme.palette.action.selected,
                        },
                      }}
                    >
                      {Object.entries(recruiter).map(([key, value]) => (
                        <TableCell
                          key={key}
                          sx={{
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            py: 1.5,
                          }}
                        >
                          {value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
                bgcolor: "background.paper",
                borderRadius: 1,
                border: `1px dashed ${theme.palette.divider}`,
              }}
            >
              <Typography color="textSecondary">No recruiters found</Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {Object.keys(submitted_Candidates).length > 0 ? (
            Object.entries(submitted_Candidates).map(
              ([recruiterId, candidates]) => (
                <Box key={recruiterId} mb={4}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      pb: 1,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <PersonIcon
                      sx={{ mr: 1, color: theme.palette.primary.main }}
                    />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Recruiter: {recruiterId}
                    </Typography>
                    <Chip
                      label={`${candidates.length} Candidate${
                        candidates.length !== 1 ? "s" : ""
                      }`}
                      size="small"
                      sx={{
                        ml: 2,
                        bgcolor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                      }}
                    />
                  </Box>

                  {Array.isArray(candidates) && candidates.length > 0 ? (
                    <TableContainer
                      component={Paper}
                      elevation={2}
                      sx={{
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow
                            sx={{ bgcolor: theme.palette.primary.light }}
                          >
                            {submittedCandidateHeaders.map((header) => (
                              <TableCell
                                key={header}
                                sx={{
                                  fontWeight: "bold",
                                  color: theme.palette.primary.contrastText,
                                  py: 1.5,
                                }}
                              >
                                {formatHeaderText(header)}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {candidates.map((candidate, index) => (
                            <TableRow
                              key={
                                candidate.candidateId || `candidate-${index}`
                              }
                              sx={{
                                "&:nth-of-type(odd)": {
                                  bgcolor: theme.palette.action.hover,
                                },
                                "&:hover": {
                                  bgcolor: theme.palette.action.selected,
                                },
                              }}
                            >
                              {submittedCandidateHeaders.map((header) => (
                                <TableCell
                                  key={header}
                                  sx={{
                                    py: 1.5,
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                  }}
                                >
                                  {header === "email" && candidate[header] ? (
                                    <a
                                      href={`mailto:${candidate[header]}`}
                                      style={{
                                        textDecoration: "none",
                                        color: theme.palette.primary.main,
                                        fontWeight: 500,
                                      }}
                                    >
                                      {candidate[header]}
                                    </a>
                                  ) : (
                                    candidate[header] || "N/A"
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
                        textAlign: "center",
                        bgcolor: "background.paper",
                      }}
                    >
                      <Typography
                        color="textSecondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        No candidates found for this recruiter.
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )
            )
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
                bgcolor: "background.paper",
                borderRadius: 1,
                border: `1px dashed ${theme.palette.divider}`,
              }}
            >
              <Typography color="textSecondary">
                No submitted candidates available.
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {Object.keys(interview_Scheduled_Candidates).length > 0 ? (
            Object.entries(interview_Scheduled_Candidates).map(
              ([recruiterId, candidates]) => (
                <Box key={recruiterId} mb={4}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      pb: 1,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <EventIcon
                      sx={{ mr: 1, color: theme.palette.success.main }}
                    />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Recruiter: {recruiterId}
                    </Typography>
                    <Chip
                      label={`${candidates.length} Interview${
                        candidates.length !== 1 ? "s" : ""
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
                        overflow: "hidden",
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow
                            sx={{ bgcolor: theme.palette.success.light }}
                          >
                            {scheduledInterviewHeaders.map((header) => (
                              <TableCell
                                key={header}
                                sx={{
                                  fontWeight: "bold",
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
                                "&:nth-of-type(odd)": {
                                  bgcolor: theme.palette.action.hover,
                                },
                                "&:hover": {
                                  bgcolor: theme.palette.action.selected,
                                },
                              }}
                            >
                              {scheduledInterviewHeaders.map((header) => (
                                <TableCell
                                  key={`${
                                    candidate.candidateId || idx
                                  }-${header}`}
                                  sx={{
                                    py: 1.5,
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                  }}
                                >
                                  {header === "email" &&
                                  candidate[header]?.includes("@") ? (
                                    <a
                                      href={
                                        candidate[header].startsWith("mailto:")
                                          ? candidate[header]
                                          : `mailto:${candidate[header]}`
                                      }
                                      style={{
                                        textDecoration: "none",
                                        color: theme.palette.success.dark,
                                        fontWeight: 500,
                                      }}
                                    >
                                      {candidate[header].replace("mailto:", "")}
                                    </a>
                                  ) : (
                                    candidate[header]
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
                        textAlign: "center",
                        bgcolor: "background.paper",
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
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
                bgcolor: "background.paper",
                borderRadius: 1,
                border: `1px dashed ${theme.palette.divider}`,
              }}
            >
              <Typography color="textSecondary">
                No scheduled interviews
              </Typography>
            </Box>
          )}
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsDialog;
