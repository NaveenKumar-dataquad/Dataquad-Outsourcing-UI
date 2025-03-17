import React from "react";
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
  useMediaQuery,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const SubmittedCandidatesTab = ({ tabValue, submitted_Candidates }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Check for small screens

  const submittedCandidateHeaders = [
    "candidateId",
    "candidateName",
    "email",
    "contactNumber",
    "interviewStatus",
    "qualification",
    "skills",
    "overallFeedback",
  ];

  const formatHeaderText = (header) => {
    return header
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <Box
      role="tabpanel"
      hidden={tabValue !== 1}
      id="job-details-tabpanel-1"
      aria-labelledby="job-details-tab-1"
    >
      {tabValue === 1 && (
        <Box 
          sx={{ 
            maxHeight: "60vh", 
            overflowY: "auto",  // Add vertical scrollbar
            overflowX: "hidden", // Prevent horizontal scrolling
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.background.default,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.primary.light,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: theme.palette.primary.main,
            },
          }}
        > 
          {Object.keys(submitted_Candidates).length > 0 ? (
            Object.entries(submitted_Candidates).map(
              ([recruiterId, candidates]) => (
                <Box key={recruiterId} mb={4}>
                  {/* Recruiter Name */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      pb: 1,
                      borderBottom: `2px solid ${theme.palette.divider}`,
                      flexWrap: 'wrap', // Allow wrapping on smaller screens
                    }}
                  >
                    <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight="bold">
                      Recruiter: {recruiterId}
                    </Typography>
                    <Chip
                      label={`${candidates.length} Candidate${candidates.length !== 1 ? "s" : ""}`}
                      size="small"
                      sx={{
                        ml: 2,
                        bgcolor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                        marginTop: isSmallScreen ? 1 : 0, // Add margin top on small screens for better spacing
                      }}
                    />
                  </Box>

                  {/* Candidates Table */}
                  {Array.isArray(candidates) && candidates.length > 0 ? (
                    <TableContainer 
                      component={Paper} 
                      elevation={2} 
                      sx={{ 
                        borderRadius: 1, 
                        maxHeight: "60vh", // Add max height to table container
                        overflowY: "auto", // Add vertical scrollbar to table
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: theme.palette.background.default,
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: theme.palette.primary.light,
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                          backgroundColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      <Table size={isSmallScreen ? "small" : "medium"}> 
                        {/* Table Header */}
                        <TableHead>
                          <TableRow sx={{ bgcolor: theme.palette.primary.light, position: 'sticky', top: 0, zIndex: 1 }}>
                            {submittedCandidateHeaders.map((header) => (
                              <TableCell
                                key={header}
                                sx={{
                                  fontWeight: "bold",
                                  color: theme.palette.primary.contrastText,
                                  py: 1.5,
                                  display: isSmallScreen && ["email", "skills", "overallFeedback"].includes(header) ? 'none' : 'table-cell', // Hide certain columns on small screens
                                }}
                              >
                                {formatHeaderText(header)}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>

                        {/* Table Body */}
                        <TableBody>
                          {candidates.map((candidate, index) => (
                            <TableRow
                              key={candidate.candidateId || `candidate-${index}`}
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
                                  key={`${candidate.candidateId || index}-${header}`}
                                  sx={{
                                    py: 1.5,
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                    display: isSmallScreen && ["email", "skills", "overallFeedback"].includes(header) ? 'none' : 'table-cell', // Hide certain columns on small screens
                                  }}
                                >
                                  {header === "email" && candidate[header] ? (
                                    <a
                                      href={`mailto:${candidate[header]}`}
                                      style={{
                                        textDecoration: "none",
                                        color: theme.palette.primary.main,
                                        fontWeight: 500,
                                        wordBreak: 'break-all', // Break long emails
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
                      <Typography color="textSecondary" sx={{ fontStyle: "italic" }}>
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
                border: `2px dashed ${theme.palette.divider}`,
              }}
            >
              <Typography color="textSecondary">No submitted candidates available.</Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SubmittedCandidatesTab;