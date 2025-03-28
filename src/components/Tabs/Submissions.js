import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
  Grid,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Container,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EventIcon from "@mui/icons-material/Event";
import InterviewForm from "../InterviewForm";
import DataTable from "../MuiComponents/DataTable";
import { Tooltip } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import SectionHeader from "../MuiComponents/SectionHeader";
import BASE_URL from "../../redux/config";

const Submissions = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [openInterviewDialog, setOpenInterviewDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [currentResume, setCurrentResume] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const userId = user;

  const generateColumns = (data) => {
    if (data.length === 0) return [];

    const headerLabels = {
      fullName: "Full Name",
      candidateId: "Candidate ID",
      emailId: "Email",
      contactNumber: "Contact Number",
      currentOrganization: "Current Organization",
      qualification: "Qualification",
      totalExperience: "Total Experience",
      relevantExperience: "Relevant Experience",
      currentCTC: "Current CTC",
      expectedCTC: "Expected CTC",
      noticePeriod: "Notice Period",
      currentLocation: "Current Location",
      preferredLocation: "Preferred Location",
      skills: "Skills",
      communicationSkills: "Communication Skills",
      requiredTechnologiesRating: "Tech Rating",
      overallFeedback: "Overall Feedback",
      userEmail: "Recruiter Email",
      interviewStatus: "Interview Status",
      jobId: "Job ID",
      resumeFilePath: "Resume",
      scheduleInterview: "Schedule Interview",
      actions: "Actions",
      addToBench: "To Bench", // Add new column
    };

    // Define which columns should have filters (select or text)
    const filterableColumns = {
      fullName: "text",
      emailId: "text",
      contactNumber: "text",
      currentOrganization: "text",
      qualification: "select",
      totalExperience: "select",
      relevantExperience: "select",
      currentCTC: "select",
      expectedCTC: "select",
      noticePeriod: "select",
      currentLocation: "select",
      preferredLocation: "select",
      skills: "text",
      interviewStatus: "select",
    };

    // Define manual column order
    const columnOrder = [
      "fullName",
      "contactNumber",
      "candidateId",
      "emailId",
      "currentOrganization",
      "qualification",
      "totalExperience",
      "relevantExperience",
      "currentCTC",
      "expectedCTC",
      "noticePeriod",
      "currentLocation",
      "preferredLocation",
      "skills",
      "communicationSkills",
      "requiredTechnologiesRating",
      "overallFeedback",
      "userEmail",
      "interviewStatus",
      "jobId",
      "resumeFilePath",
      "scheduleInterview",
      "addToBench", // Add new column
      "actions",
    ];

    return columnOrder
      .filter((key) => data[0].hasOwnProperty(key)) // Ensure the key exists in the data
      .map((key) => ({
        key: key,
        label: headerLabels[key] || key.replace(/([A-Z])/g, " $1").trim(),
        ...(filterableColumns[key] ? { type: filterableColumns[key] } : {}), // Apply type only if defined
      }));
  };

  const fetchCurrentResume = async (candidateId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/candidate/download\-resume/${candidateId}`,
        {
          responseType: "blob",
          headers: { "Content-Type": "application/json" },
        }
      );

      const fileName = response.headers["content-disposition"]
        ? response.headers["content-disposition"].split("filename=")[1]
        : "resume.pdf";

      const file = new File([response.data], fileName, {
        type: response.data.type,
      });

      setCurrentResume(file);
      return file;
    } catch (error) {
      console.error("Error fetching resume:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch current resume",
        severity: "error",
      });
      return null;
    }
  };

  const downloadResume = async (candidateId) => {
    try {
      setLoading(true);
      const resumeUrl = `${BASE_URL}/candidate/download\-resume/${candidateId}`;

      console.log("Downloading Resume from:", resumeUrl);

      const response = await axios.get(resumeUrl, {
        responseType: "blob",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.data) {
        throw new Error("No file received from the server.");
      }

      // Get the file extension from the response content-type
      const contentType = response.headers["content-type"];
      const extension =
        contentType === "application/pdf"
          ? ".pdf"
          : contentType === "application/msword"
          ? ".doc"
          : contentType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ? ".docx"
          : ".pdf"; // default to .pdf if content-type is not recognized

      // Create filename using candidateId
      const filename = `${candidateId}${extension}`;

      const blob = new Blob([response.data], { type: response.data.type });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading resume:", error);
      setSnackbar({
        open: true,
        message: "Failed to download resume. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissionData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/candidate/submissions/${userId}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Fetched Candidate Data:", response.data); // 🔍 Debugging step

      const userData = response.data || [];

      const processedData = userData.map((item) => ({
        ...item,
        resumeFilePath: item.candidateId ? (
          <a
            href={`${BASE_URL}/candidate/download\-resume/${item.candidateId}`}
            onClick={(e) => {
              e.preventDefault();
              downloadResume(item.candidateId);
            }}
            style={{
              color: "blue",
              textDecoration: "underline",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Download Resume
            <OpenInNewIcon fontSize="small" />
          </a>
        ) : (
          <Typography variant="body2" color="error">
            No Resume Available
          </Typography>
        ),
        scheduleInterview: (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<EventIcon />}
            onClick={() => handleOpenInterviewDialog(item)}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              whiteSpace: "nowrap",
            }}
          >
            Schedule Interview
          </Button>
        ),
        actions: (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip title="Edit">
              <IconButton
                color="primary"
                onClick={() => handleEditCandidate(item)}
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
                onClick={() => handleDeleteClick(item)}
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
        addToBench: (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleAddToBench(item);
            }}
            style={{
              display: "inline-block",
              padding: "6px 12px",
              backgroundColor: "#2A4DBD",
              color: "#FFFFFF",
              textDecoration: "none",
              borderRadius: "8px",
              whiteSpace: "nowrap",
              fontSize: "14px",
            }}
          >
            Add to Bench
          </a>
        ),
      }));

      setData(processedData);
      if (processedData.length > 0) {
        setColumns(generateColumns(processedData));
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setSnackbar({
        open: true,
        message: "Failed to fetch candidates. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSubmissionData();
    }
  }, [userId]);

  const handleOpenInterviewDialog = (candidate) => {
    setSelectedCandidate(candidate);
    setOpenInterviewDialog(true);
  };

  const handleCloseInterviewDialog = () => {
    setOpenInterviewDialog(false);
    setSelectedCandidate(null);
  };

  const handleEditCandidate = async (candidate) => {
    setEditingCandidate(candidate);
    const resumeFile = await fetchCurrentResume(candidate.candidateId);
    if (resumeFile) {
      setEditingCandidate((prev) => ({
        ...prev,
        resumeFile: resumeFile,
        resumeFileName: resumeFile.name,
      }));
    }
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingCandidate(null);
    setFormErrors({});
    setCurrentResume(null);
  };

  const handleDeleteClick = (candidate) => {
    setCandidateToDelete(candidate);
    setDeleteDialogOpen(true);
  };

  const updateCandidate = async () => {
    try {
      setLoading(true);
      const { candidateId, resumeFile, emailId, ...otherFields } =
        editingCandidate; // Extract emailId

      const formData = new FormData();

      const numericFields = {
        totalExperience: parseFloat(otherFields.totalExperience),
        relevantExperience: parseFloat(otherFields.relevantExperience),
        requiredTechnologiesRating: parseFloat(
          otherFields.requiredTechnologiesRating
        ),
      };

      Object.entries(numericFields).forEach(([key, value]) => {
        if (!isNaN(value)) {
          formData.append(key, value);
        }
      });

      Object.entries(otherFields).forEach(([key, value]) => {
        if (
          value !== null &&
          value !== undefined &&
          !Object.keys(numericFields).includes(key)
        ) {
          formData.append(key, value.toString());
        }
      });

      // ✅ Send `candidateEmailId` instead of `emailId`
      if (emailId) {
        formData.append("candidateEmailId", emailId);
      }

      if (resumeFile instanceof File) {
        formData.append("resumeFile", resumeFile);
      }

      const response = await axios.put(
        `${BASE_URL}/candidate/candidatesubmissions/${candidateId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { message, payload } = response.data;

      const successMessage = `${message}
    Candidate ID: ${payload?.candidateId}
    Employee ID: ${payload?.employeeId}
    Job ID: ${payload?.jobId}
    Candidate Email ID: ${payload?.candidateEmailId}`; // ✅ Updated success message

      setSnackbar({
        open: true,
        message: successMessage,
        severity: "success",
      });

      handleCloseEditDialog();
      fetchSubmissionData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to update candidate: ${
          error.response?.data?.message || "Please try again"
        }`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCandidate = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${BASE_URL}/candidate/deletecandidate/${candidateToDelete.candidateId}`
      );
      setSnackbar({
        open: true,
        message: "Candidate deleted successfully!",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      fetchSubmissionData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete candidate. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBench = async (candidate) => {
    console.log("Candidate Data:", candidate);
    
    try {
      setLoading(true);
      const formData = new FormData();
      
      formData.append("fullName", candidate.fullName);
      formData.append("email", candidate.emailId);
      formData.append("contactNumber", candidate.contactNumber);
      formData.append("relevantExperience", candidate.relevantExperience);
      formData.append("totalExperience", candidate.totalExperience);
      
      // ✅ Convert skills string to an array and send as JSON string
      const skillsArray = candidate.skills ? candidate.skills.split(",").map(skill => skill.trim()) : [];
      formData.append("skills", JSON.stringify(skillsArray)); // 🔥 Send as JSON string
  
      formData.append("linkedin", candidate.linkedin || ""); // Handle optional fields
      formData.append("referredBy", candidate.userEmail);
  
      // ✅ Fetch and append resume file if available
      const resumeFile = await fetchCurrentResume(candidate.candidateId);
      if (resumeFile) {
        formData.append("resumeFiles", resumeFile);
      }
  
      await axios.post(`${BASE_URL}/candidate/bench/save`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      setSnackbar({
        open: true,
        message: "Candidate moved to bench successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error moving to bench:", error);
      setSnackbar({
        open: true,
        message: "Failed to move candidate to bench. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  
  
  if (!userId) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
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
        data={data}
        columns={columns}
        pageLimit={10}
        title="Submissions"
        onRefresh={fetchSubmissionData}
        isRefreshing={loading}
      />

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3, // Rounded corners
            padding: 2,
            minWidth: "600px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "1.25rem",
            bgcolor: "#00796b", // Header background color
            color: "#FFF", // White text
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 2,
          }}
        >
          Edit Candidate
          <IconButton
            aria-label="close"
            onClick={handleCloseEditDialog}
            sx={{
              color: "#FFF",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {editingCandidate && (
            <Box
              component="form"
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Grid container spacing={2}>
                {Object.entries(editingCandidate).map(([key, value]) => {
                  if (
                    [
                      "resumeFilePath",
                      "resumeFile",
                      "scheduleInterview",
                      "actions",
                      "addToBench",
                    ].includes(key)
                  )
                    return null;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      {key === "interviewStatus" ? (
                        <FormControl fullWidth>
                          <InputLabel>Interview Status</InputLabel>
                          <Select
                            value={value || ""}
                            onChange={(e) =>
                              setEditingCandidate({
                                ...editingCandidate,
                                [key]: e.target.value,
                              })
                            }
                          >
                            <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                            <MenuItem value="COMPLETED">Completed</MenuItem>
                            <MenuItem value="PENDING">Pending</MenuItem>
                            <MenuItem value="CANCELLED">Cancelled</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <TextField
                          fullWidth
                          label={key.replace(/([A-Z])/g, " $1").trim()}
                          value={value || ""}
                          onChange={(e) =>
                            setEditingCandidate({
                              ...editingCandidate,
                              [key]: e.target.value,
                            })
                          }
                          margin="dense"
                          disabled={[
                            "candidateId",
                            "jobId",
                            "userId",
                            "userEmail",
                          ].includes(key)}
                          sx={{ bgcolor: "#FFF", borderRadius: 1 }}
                        />
                      )}
                    </Grid>
                  );
                })}

                {/* Resume Upload Section */}
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: "1px dashed",
                      borderColor: "primary.main",
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                    >
                      Upload Resume
                    </Typography>

                    {/* Current Resume Display */}
                    {editingCandidate.resumeFile && (
                      <Box
                        sx={{ mb: 2, display: "flex", alignItems: "center" }}
                      >
                        <AttachFileIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Current: {editingCandidate.resumeFileName}
                        </Typography>
                      </Box>
                    )}

                    {/* File Upload Input with Styled Button */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<AttachFileIcon />}
                      >
                        Upload New Resume
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.doc,.docx"
                          onChange={(e) =>
                            setEditingCandidate({
                              ...editingCandidate,
                              resumeFile: e.target.files[0],
                              resumeFileName: e.target.files[0]?.name || "",
                            })
                          }
                        />
                      </Button>
                      {editingCandidate.resumeFile && (
                        <Typography variant="body2" color="text.secondary">
                          Selected: {editingCandidate.resumeFileName}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "flex-end", p: 2 }}>
          <Button
            onClick={handleCloseEditDialog}
            variant="outlined"
            color="primary"
            startIcon={<CloseIcon />}
            sx={{
              borderColor: "#D32F2F",
              color: "#D32F2F",
              "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" },
            }}
          >
            Discard Changes
          </Button>

          <Button
            onClick={updateCandidate}
            variant="contained"
            sx={{
              backgroundColor: "primary.main", // Primary background color
              color: "#FFF", // White text
              "&:hover": { backgroundColor: "#005f56" }, // Hover effect
              ml: 2, // Space between buttons
            }}
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#FFF" }} />
            ) : (
              "Update Candidate"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "1.25rem",
            bgcolor: "#00796b", // Red background
            color: "#FFF", // White text
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 2,
          }}
        >
          Confirm Delete
          <IconButton
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: "#FFF",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
            Are you sure you want to delete <b>{candidateToDelete?.fullName}</b>
            's submission?
            <br />
            <Typography component="span" color="error">
              This action cannot be undone.
            </Typography>
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "flex-end", p: 2 }}>
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
            onClick={deleteCandidate}
            color="error"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: "#D32F2F",
              "&:hover": { backgroundColor: "#B71C1C" },
              ml: 2, // Space between buttons
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#FFF" }} />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Interview Dialog */}
      <Dialog
        open={openInterviewDialog}
        onClose={handleCloseInterviewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "#00796b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" sx={{ color: "#FFF", fontWeight: 600 }}>
            Schedule Interview
          </Typography>
          <IconButton
            onClick={handleCloseInterviewDialog}
            size="small"
            sx={{ color: "#FFF" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <InterviewForm
            jobId={selectedCandidate?.jobId}
            candidateId={selectedCandidate?.candidateId}
            candidateFullName={selectedCandidate?.fullName}
            candidateContactNo={selectedCandidate?.contactNumber}
            clientName={selectedCandidate?.currentOrganization}
            userId={selectedCandidate?.userId}
            candidateEmailId={selectedCandidate?.emailId}
            userEmail={selectedCandidate?.userEmail}
            handleCloseInterviewDialog={handleCloseInterviewDialog}
            onSuccess={() => {
              handleCloseInterviewDialog();
              fetchSubmissionData();
              setSnackbar({
                open: true,
                message: "Interview scheduled successfully!",
                severity: "success",
              });
            }}
            onError={(error) => {
              setSnackbar({
                open: true,
                message:
                  error || "Failed to schedule interview. Please try again.",
                severity: "error",
              });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Global Snackbar */}
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
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading Backdrop */}
      <Dialog
        open={loading}
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <CircularProgress />
      </Dialog>
    </Container>
  );
};

export default Submissions;
