import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  CircularProgress,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Button,
  TextField,
  Snackbar,
  Alert,
  DialogActions,
  Container,
  ButtonGroup,
  Tooltip,
  MenuItem,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DataTable from "../MuiComponents/DataTable";
import BASE_URL from "../../redux/config";
import SectionHeader from "../MuiComponents/SectionHeader";
import { ListIcon } from "lucide-react";


const INTERVIEW_LEVELS = {
  ALL: "all",
  INTERNAL: "Internal",
  EXTERNAL: "External",
};
const INTERVIEW_STATUSES = [
  "SCHEDULED",
  "SCREEN_SELECTED",
  "CANCELLED",
  "RESCHEDULED",
  "REJECTED",
  "SELECTED",
  "PLACED",
];

const Interview = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterLevel, setFilterLevel] = useState(INTERVIEW_LEVELS.ALL);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState(null);
  const [candidateDetailsOpen, setCandidateDetailsOpen] = useState(false);
  const [candidateDetailsData, setCandidateDetailsData] = useState(null);
  const [candidateDetailsLoading, setCandidateDetailsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { user } = useSelector((state) => state.auth);
  const userId = user;

  const generateColumns = (data) => {
    if (data.length === 0) return [];

    const headerLabels = {
      candidateId: "Candidate ID",
      candidateName: "Candidate Name",
      candidateEmailId: "Candidate Email",
      candidateContactNo: "Contact Number",
      clientName: "Client Name",
      interviewLevel: "Interview Level",
      interviewDateTime: "Interview Time",
      duration: "Duration",
      zoomLink: "Interview Link",
      interviewScheduledTimestamp: "Scheduled On",
      userEmail: "Recruiter Email",
      clientEmail: "Client Email",
      interviewStatus: "Interview Status",
      scheduleInterview: "Schedule Interview",
      actions: "Actions",
    };

    // Define which columns should have filters (select or text)
    const filterableColumns = {
      candidateName: "text",
      candidateEmailId: "text",
      candidateContactNo: "text",
      interviewLevel: "select",
      interviewDateTime: "text",
      duration: "text",
      interviewStatus: "select",
      interviewDateTime: "select",
    };

    // Define manual column order
    const columnOrder = [
      "candidateName",
      "candidateId",
      "candidateEmailId",
      "candidateContactNo",
      "clientName",
      "interviewLevel",
      "interviewDateTime",
      "duration",
      "zoomLink",
      "interviewScheduledTimestamp",
      "userEmail",
      "clientEmail",
      "interviewStatus",
      "scheduleInterview",
      "actions", // Ensuring Actions is always included
    ];

    return columnOrder
      .filter(
        (key) =>
          key === "actions" || data.some((row) => row.hasOwnProperty(key))
      ) // Ensuring actions column is included
      .map((key) => {
        // Make candidateId clickable
        if (key === "candidateId") {
          return {
            key: key,
            label: headerLabels[key] || key.replace(/([A-Z])/g, " $1").trim(),
            render: (value, row) => (
              <Button
                color="primary"
                variant="text"
                onClick={() => handleCandidateIdClick(value)}
                sx={{
                  textDecoration: "underline",
                  "&:hover": { backgroundColor: "transparent" },
                }}
              >
                {value}
              </Button>
            ),
          };
        }
        
        return {
          key: key,
          label: headerLabels[key] || key.replace(/([A-Z])/g, " $1").trim(),
          ...(filterableColumns[key] ? { type: filterableColumns[key] } : {}), // Apply type only if defined
        };
      });
  };

  const handleCandidateIdClick = async (candidateId) => {
    setCandidateDetailsLoading(true);
    setCandidateDetailsOpen(true);
    
    try {
      const response = await axios.get(
        `${BASE_URL}/candidate/scheduledCandidates/${candidateId}`
      );
      
      setCandidateDetailsData(response.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch candidate details. Please try again.",
        severity: "error",
      });
      console.error("Error fetching candidate details:", error);
    } finally {
      setCandidateDetailsLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    try {
      return new Date(dateTime).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    } catch (error) {
      return "";
    }
  };

  const fetchInterviewDetails = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/candidate/interviews/${userId}`
      );
      const interviewData = response.data || [];

      // Modified to show all interviews instead of just scheduled ones
      const processedData = interviewData.map((interview) => ({
        ...interview,
        interviewDateTime: formatDateTime(interview.interviewDateTime),
        interviewScheduledTimestamp: formatDateTime(
          interview.interviewScheduledTimestamp
        ),
        duration: interview.duration ? `${interview.duration} minutes` : "",
        zoomLink: interview.zoomLink ? (
          <Button
            variant="contained"
            size="small"
            href={interview.zoomLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              textTransform: "none",
              minWidth: "100px",
              fontSize: "0.875rem",
            }}
          >
            Join Meeting
          </Button>
        ) : (
          ""
        ),
        actions: (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip title="Edit">
              <IconButton
                color="primary"
                onClick={() => handleEditInterview(interview)}
                sx={{
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#1B3A8C1A" },
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => handleDeleteClick(interview)}
                sx={{
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#B71C1C1A" },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      }));

      setData(processedData);
      if (processedData.length > 0) {
        const generatedColumns = generateColumns(processedData);
        setColumns(generatedColumns);
      }
      applyFilter(processedData, filterLevel);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch interview details. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviewDetails();
  }, [userId]);

  const handleEditInterview = (interview) => {
    setEditingInterview(interview);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (interview) => {
    setInterviewToDelete(interview);
    setDeleteDialogOpen(true);
  };

  const updateInterview = async () => {
    if (!editingInterview || !userId) return;

    const payload = {
      interviewDateTime: editingInterview.interviewDateTime,
      duration: editingInterview.duration,
      zoomLink: editingInterview.zoomLink,
      userId: userId,
      candidateId: editingInterview.candidateId,
      jobId: editingInterview.jobId,
      clientName: editingInterview.clientName,
      fullName: editingInterview.fullName,
      contactNumber: editingInterview.contactNumber,
      userEmail: editingInterview.userEmail,
      interviewLevel: editingInterview.interviewLevel,
      clientEmail: editingInterview.clientEmail,
      interviewStatus: editingInterview.interviewStatus, // Include interviewStatus in payload
    };

    try {
      setLoading(true);
      await axios.put(
        `${BASE_URL}/candidate/interview-update/${userId}/${editingInterview.candidateId}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setSnackbar({
        open: true,
        message: "Interview updated successfully!",
        severity: "success",
      });
      setEditDialogOpen(false);
      fetchInterviewDetails();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update interview. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteInterview = async () => {
    if (!interviewToDelete || !interviewToDelete.candidateId) return;

    try {
      setLoading(true);
      await axios.delete(
        `${BASE_URL}/candidate/deleteinterview/${interviewToDelete.candidateId}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setSnackbar({
        open: true,
        message: "Interview deleted successfully!",
        severity: "success",
      });

      setDeleteDialogOpen(false);
      fetchInterviewDetails();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete interview. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (interviews, level) => {
    let filtered =
      level === INTERVIEW_LEVELS.ALL
        ? interviews
        : interviews.filter((interview) => interview.interviewLevel === level);
    setFilteredData(filtered);
  };

  const handleFilterChange = (level) => {
    setFilterLevel(level);
    applyFilter(data, level);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Get status color based on interview status
  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "#4CAF50"; // Green
      case "SCHEDULED":
        return "#2196F3"; // Blue
      case "CANCELLED":
        return "#F44336"; // Red
      case "REJECTED":
        return "#D32F2F"; // Dark Red
      case "SELECTED":
        return "#00C853"; // Bright Green
      case "PLACED":
        return "#6200EA"; // Purple
      default:
        return "#757575"; // Grey
    }
  };

  return (
    <Container
      maxWidth={false} // 1) No fixed max width
      disableGutters // 2) Remove horizontal padding
      sx={{
        width: "100%", // Fill entire viewport width
        height: "calc(100vh - 20px)", // Fill entire viewport height
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      {/* <SectionHeader
        title="Interview Schedule"
        totalCount={filteredData.length}
        onRefresh={fetchInterviewDetails}
        isRefreshing={loading}
        icon={<ListIcon sx={{ color: "#FFF" }} />} // Optional: Custom icon
      /> */}

      <DataTable
        data={filteredData}
        columns={columns}
        pageLimit={5}
        title="Interviews"
        onRefresh={fetchInterviewDetails}
        isRefreshing={loading}
      />

      {/* Candidate Details Dialog */}
      <Dialog
        open={candidateDetailsOpen}
        onClose={() => setCandidateDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            padding: 2,
            minWidth: "500px",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderRadius: 2,
            fontWeight: "bold",
            fontSize: "1.25rem",
            bgcolor: "#1976d2", // Blue background
            color: "#FFF",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", flexGrow: 1 }}>
            Candidate Interview History
          </Typography>

          <IconButton
            onClick={() => setCandidateDetailsOpen(false)}
            sx={{
              color: "#FFF",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
              p: 1,
            }}
          >
            <CloseIcon fontSize="medium" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {candidateDetailsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : candidateDetailsData ? (
            <Box>
              {/* Basic Info */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 2,
                  background: "linear-gradient(to right, #f5f7fa, #e4e7eb)"
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {candidateDetailsData[0]?.candidateName || "Candidate"} - {candidateDetailsData[0]?.jobId || ""}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  {candidateDetailsData[0]?.clientName || "Client"} 
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Rounds: {candidateDetailsData.find(item => item.totalInterviewRounds)?.totalInterviewRounds || "N/A"}
                </Typography>
              </Paper>

              {/* Interview Timeline */}
              <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #e0e0e0', pb: 1 }}>
                Interview Timeline
              </Typography>
              
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {candidateDetailsData
                  .filter(item => !item.totalInterviewRounds) // Filter out the summary object
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort by timestamp descending
                  .map((interview, index) => (
                    <React.Fragment key={index}>
                      <ListItem 
                        alignItems="flex-start"
                        sx={{ 
                          borderLeft: `4px solid ${getStatusColor(interview.interviewStatus)}`,
                          pl: 2,
                          mb: 1
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {interview.interviewStatus.replace(/_/g, " ")} - {interview.interviewLevel}
                            </Typography>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                sx={{ display: 'block' }}
                              >
                                {interview.stage && interview.stage !== "N/A" ? `Stage: ${interview.stage}` : ""}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(interview.timestamp).toLocaleString()}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {index < candidateDetailsData.length - 2 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
              </List>
            </Box>
          ) : (
            <Typography>No candidate details available</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={() => setCandidateDetailsOpen(false)}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3, // Rounded corners for modern look
            padding: 2,
            minWidth: "500px",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderRadius: 2,
            fontWeight: "bold",
            fontSize: "1.25rem",
            bgcolor: "#00796b", // Background color
            color: "#FFF", // White text for contrast
            p: 2, // Padding for a clean look
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // Ensures proper spacing
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", flexGrow: 1 }}>
            Edit Interview
          </Typography>

          <IconButton
            onClick={() => setEditDialogOpen(false)}
            sx={{
              color: "#FFF", // White close button
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" }, // Subtle hover effect
              p: 1, // Adjust padding for better alignment
            }}
          >
            <CloseIcon fontSize="medium" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          {editingInterview && (
            <Box sx={{ flexGrow: 1, mt: 2 }}>
              <Grid container spacing={2}>
                {Object.entries(editingInterview).map(([key, value]) => {
                  if (
                    ![
                      "Actions",
                      "id",
                      "interviewDateTime",
                      "externalInterviewDetails",
                      "interviewStatus", // Skip this since we'll add it separately below
                    ].includes(key)
                  ) {
                    return (
                      <Grid item xs={12} sm={6} key={key}>
                        {/* Dropdown for interviewLevel */}
                        {key === "interviewLevel" ? (
                          <TextField
                            select
                            label="Interview Level"
                            value={value || editingInterview.interviewLevel}
                            onChange={(e) =>
                              setEditingInterview({
                                ...editingInterview,
                                [key]: e.target.value,
                              })
                            }
                            fullWidth
                            sx={{ bgcolor: "white", borderRadius: 1 }}
                          >
                            <MenuItem value="INTERNAL">Internal</MenuItem>
                            <MenuItem value="EXTERNAL">External</MenuItem>
                          </TextField>
                        ) : (
                          <TextField
                            label={key.replace(/([A-Z])/g, " $1").trim()}
                            value={value || ""}
                            onChange={(e) =>
                              setEditingInterview({
                                ...editingInterview,
                                [key]: e.target.value,
                              })
                            }
                            fullWidth
                            sx={{ bgcolor: "white", borderRadius: 1 }}
                            disabled={[
                              "jobId",
                              "candidateId",
                              "userId",
                              "interviewScheduledTimestamp",
                              "userEmail",
                            ].includes(key)}
                          />
                        )}
                      </Grid>
                    );
                  }
                  return null;
                })}

                {/* Add Interview Status Dropdown */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Interview Status"
                    value={editingInterview.interviewStatus || "SCHEDULED"}
                    onChange={(e) =>
                      setEditingInterview({
                        ...editingInterview,
                        interviewStatus: e.target.value,
                      })
                    }
                    fullWidth
                    sx={{ bgcolor: "white", borderRadius: 1 }}
                  >
                    {INTERVIEW_STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Ensure interviewDateTime appears immediately after interviewScheduledTimestamp */}
                {editingInterview.interviewScheduledTimestamp && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      key="interviewDateTime"
                      label="Interview Date & Time"
                      type="datetime-local"
                      value={
                        editingInterview.interviewDateTime
                          ? new Date(editingInterview.interviewDateTime)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) => {
                        const selectedDate = new Date(e.target.value);
                        setEditingInterview({
                          ...editingInterview,
                          interviewDateTime: selectedDate.toISOString(),
                        });
                      }}
                      fullWidth
                      sx={{ bgcolor: "white", borderRadius: 1 }}
                    />
                  </Grid>
                )}

                {/* Show External Interview Details when interviewLevel is EXTERNAL */}
                {editingInterview.interviewLevel === "EXTERNAL" && (
                  <Grid item xs={12}>
                    <TextField
                      key="externalInterviewDetails"
                      label="External Interview Details"
                      multiline
                      rows={3}
                      value={editingInterview.externalInterviewDetails || ""}
                      onChange={(e) =>
                        setEditingInterview({
                          ...editingInterview,
                          externalInterviewDetails: e.target.value,
                        })
                      }
                      fullWidth
                      sx={{ bgcolor: "white", borderRadius: 1 }}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{ justifyContent: "flex-end", alignItems: "center", p: 2 }}
        >
          <Button
            onClick={() => setEditDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: "#4CAF50",
              color: "primary",
              "&:hover": { backgroundColor: "rgba(76, 175, 80, 0.1)" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={updateInterview}
            color="primary"
            variant="contained"
            sx={{
              backgroundColor: "primary",
              "&:hover": { backgroundColor: "#005f56" },
              ml: 2, // Adds spacing between buttons
            }}
          >
            Update Interview
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3, // Rounded corners for modern look
            padding: 2,
            minWidth: "350px",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>
          Confirm Delete
          <IconButton
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "grey.600",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.1)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
            Are you sure you want to delete this interview? <br />
            <b>This action cannot be undone.</b>
          </Typography>

          {interviewToDelete && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "#f9f9f9",
                borderRadius: 2,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="subtitle2" color="text.primary">
                Candidate Details:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <b>Candidate:</b> {interviewToDelete.candidateFullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <b>Email:</b> {interviewToDelete.candidateEmailId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <b>Interview Date:</b>{" "}
                {interviewToDelete.interviewDateTime || "Not Scheduled"}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: "#4CAF50",
              color: "primary",
              "&:hover": { backgroundColor: "rgba(76, 175, 80, 0.1)" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={deleteInterview}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{
              backgroundColor: "#D32F2F",
              "&:hover": { backgroundColor: "#B71C1C" },
            }}
          >
            Delete Interview
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Interview;