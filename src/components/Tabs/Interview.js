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
      interviewLevel: "Interview Level",
      interviewDateTime: "Interview Time",
      duration: "Duration",
      zoomLink: "Meeting Link",
      interviewScheduledTimestamp: "Scheduled On",
      userEmail: "Recruiter Email",
      clientEmail: "Client Email",
      clientName: "Client Name",
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
      "interviewLevel",
      "interviewDateTime",
      "duration",
      "zoomLink",
      "interviewScheduledTimestamp",
      "userEmail",
      "clientEmail",
      "clientName",
      "interviewStatus",
      "scheduleInterview",
      "actions", // Ensuring Actions is always included
    ];

    return columnOrder
      .filter(
        (key) =>
          key === "actions" || data.some((row) => row.hasOwnProperty(key))
      ) // Ensuring actions column is included
      .map((key) => ({
        key: key,
        label: headerLabels[key] || key.replace(/([A-Z])/g, " $1").trim(),
        ...(filterableColumns[key] ? { type: filterableColumns[key] } : {}), // Apply type only if defined
      }));
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
      const response = await axios.get(`${BASE_URL}/candidate/interviews/${userId}`);
      const interviewData = response.data || [];
  
      const processedData = interviewData.map((interview) => ({
        ...interview,
        interviewDateTime: interview.interviewDateTime ? formatDateTime(interview.interviewDateTime) : "N/A",
        interviewScheduledTimestamp: interview.interviewScheduledTimestamp ? formatDateTime(interview.interviewScheduledTimestamp) : "N/A",
        duration: interview.duration ? `${interview.duration} minutes` : "N/A",
        zoomLink: interview.zoomLink ? (
          <Button
            variant="contained"
            size="small"
            href={interview.zoomLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ textTransform: "none", minWidth: "100px", fontSize: "0.875rem" }}
          >
            Join Meeting
          </Button>
        ) : "N/A",
        actions: (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip title="Edit">
              <IconButton
                color="primary"
                onClick={() => handleEditInterview(interview)}
                sx={{ borderRadius: "8px", "&:hover": { backgroundColor: "#1B3A8C1A" } }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => handleDeleteClick(interview)}
                sx={{ borderRadius: "8px", "&:hover": { backgroundColor: "#B71C1C1A" } }}
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
  
      applyFilter(processedData, filterLevel); // Apply existing filters if any
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
      interviewStatus: editingInterview.interviewStatus,
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
      <DataTable
        data={filteredData}
        columns={columns}
        pageLimit={20}
        title="Interview Schedule"
        onRefresh={fetchInterviewDetails}
        isRefreshing={loading}
        noDataMessage={
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Records Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No interviews have been scheduled yet.
            </Typography>
          </Box>
        }
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      />

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
                        ) : key === "interviewStatus" ? (
                          <TextField
                            select
                            label="Interview Status"
                            value={value || editingInterview.interviewStatus}
                            onChange={(e) =>
                              setEditingInterview({
                                ...editingInterview,
                                [key]: e.target.value,
                              })
                            }
                            fullWidth
                            sx={{ bgcolor: "white", borderRadius: 1 }}
                          >
                            <MenuItem value="Scheduled">Scheduled</MenuItem>
                            <MenuItem value="Rescheduled">Rescheduled</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                            <MenuItem value="Selected">Selected</MenuItem>
                            <MenuItem value="Placed">Placed</MenuItem>
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
            Reschedule Interview
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
