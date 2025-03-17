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
  Grid,
  Card,
  CardContent,
  Container,
  Fade,
  Alert,
  AlertTitle,
  Skeleton,
  Paper,
  Tooltip,
  useTheme,
  Link,
} from "@mui/material";
import {
  Close as CloseIcon,
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import CandidateSubmissionForm from "../CandidateSubmissionFrom";
import CustomDialog from "../MuiComponents/CustomDialog";
import DataTable from "../MuiComponents/DataTable";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SectionHeader from "../MuiComponents/SectionHeader";

import BASE_URL from "../../redux/config";



const Assigned = () => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [selectedJobForSubmit, setSelectedJobForSubmit] = useState(null);
  const [openDescriptionDialog, setOpenDescriptionDialog] = useState(false);
  const [selectedJobDescription, setSelectedJobDescription] = useState("");
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [employeesList, setEmployeesList] = useState([]);
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [fetchError, setFetchError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const userId = user;

  const generateColumns = (data) => {
    if (data.length === 0) return [];

    return [
      { key: "submitCandidate", label: "Actions" },
      { key: "jobTitle", label: "Job Title", type: "text" },
      { key: "jobId", label: "Job ID", type: "select" },
      { key: "clientName", label: "Client Name", type: "text" },
      {
        key: "assignedBy",
        label: "Assigned By",
        type: "text",
        render: (row) => (row.assignedBy ? row.assignedBy : " Not_found "),
      },
      { key: "jobDescription", label: "Job Description" },
      { key: "jobType", label: "Job Type", type: "select" },
      { key: "jobMode", label: "Job Mode", type: "select" },
      { key: "location", label: "Location", type: "text" },
      { key: "experienceRequired", label: "Experience Required", type: "text" },
      { key: "noticePeriod", label: "Notice Period", type: "select" },
      { key: "relevantExperience", label: "Relevant Experience", type: "text" },
      { key: "qualification", label: "Qualification", type: "text" },
      {
        key: "requirementAddedTimeStamp",
        label: "Posted Date",
        type: "select",
      },
      { key: "status", label: "Status", type: "select" },
      { key: "salaryPackage", label: "Salary Package", type: "text" },
      { key: "noOfPositions", label: "Positions", type: "text" },
    ];
  };

  const fetchUserSpecificData = async () => {
    setIsRefreshing(true);
    setFetchStatus("loading");
    try {
      const response = await axios.get(
        `${BASE_URL}/requirements/recruiter/${userId}`
      );
      const userData = response.data || [];
      setTotalCount(response.data.totalCount || userData.length || 0);

      // Sort data by latest date first (Descending Order)
      const sortedData = userData.sort(
        (a, b) =>
          new Date(b.requirementAddedTimeStamp) -
          new Date(a.requirementAddedTimeStamp)
      );

      const processedData = sortedData.map((item) => ({
        ...item,
        jobDescription: (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {item.jobDescription ? (
              // If text job description is available
              <>
                <Typography noWrap sx={{ maxWidth: 250 }}>
                  {item.jobDescription.slice(0, 15)}
                  {item.jobDescription.length > 15 && "..."}
                </Typography>
                {item.jobDescription.length > 15 && (
                  <Tooltip title="View Full Description">
                    <Button
                      onClick={() =>
                        handleOpenDescriptionDialog(
                          item.jobDescription,
                          item.jobTitle
                        )
                      }
                      size="small"
                      startIcon={<DescriptionIcon />}
                      sx={{ minWidth: 0 }}
                    >
                      more
                    </Button>
                  </Tooltip>
                )}
              </>
            ) : (
              // If JD is a file/image, show download button
              <Tooltip title="Download Job Description">
                <Link
                  href={`/requirements/download-job-description/${item.jobId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="none"
                >
                  <a
                    href={`${BASE_URL}/requirements/download-job-description/${item.jobId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="blue"
                  >
                    Download JD
                  </a>
                </Link>
              </Tooltip>
            )}
          </Box>
        ),
        requirementAddedTimeStamp: item.requirementAddedTimeStamp
          ? new Date(item.requirementAddedTimeStamp).toISOString().split("T")[0] // Extract only YYYY-MM-DD
          : "N/A", // Handle missing timestamps
        salaryPackage: item.salaryPackage ? `${item.salaryPackage} LPA` : "N/A",
        submitCandidate: (
          <Tooltip title={
            item.status === "Closed" || item.status === "Hold" 
              ? "Submissions disabled for closed/hold jobs" 
              : "Submit Candidate"
          }>
            <span> {/* Wrapping with span to allow disabled tooltip */}
              <Button
                onClick={() => handleOpenSubmitDialog(item.jobId)}
                startIcon={<UploadIcon />}
                variant="contained"
                size="small"
                sx={{ borderRadius: 2 }}
                disabled={item.status === "Closed" || item.status === "Closed"}
              >
                Submit
              </Button>
            </span>
          </Tooltip>
        ),
      }));

      setData(processedData);
      setColumns(generateColumns(processedData)); // Set columns in the new format
      setFetchStatus("succeeded");
    } catch (err) {
      setFetchStatus("failed");
      setFetchError(err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      setFetchStatus("loading");
      try {
        const response = await axios.get(`${BASE_URL}/users/employee`);
        setEmployeesList(response.data);
        setFetchStatus("succeeded");
      } catch (error) {
        setFetchStatus("failed");
        setFetchError(error.message);
      }
    };

    if (fetchStatus === "idle") {
      fetchEmployees();
    }
  }, [fetchStatus]);

  const getEmployeeEmail = (userId, employeesList) => {
    const employee = employeesList.find((emp) => emp.employeeId === userId);
    return employee ? employee.email : null;
  };

  const employeeEmail = getEmployeeEmail(userId, employeesList);

  useEffect(() => {
    if (!userId) return;
    fetchUserSpecificData();
  }, [userId]);

  const handleRefresh = () => {
    fetchUserSpecificData();
  };

  const handleOpenSubmitDialog = (job) => {
    // Additional safety check to prevent submissions for CLOSED/HOLD jobs
    const selectedJob = data.find(item => item.jobId === job);
    if (selectedJob && (selectedJob.status === "Closed" || selectedJob.status === "Hold")) {
      return; 
    }
    
    setSelectedJobForSubmit(job);
    setOpenSubmitDialog(true);
  };

  const handleCloseSubmitDialog = () => {
    setOpenSubmitDialog(false);
    setSelectedJobForSubmit(null);
  };

  const handleOpenDescriptionDialog = (description, jobTitle) => {
    setSelectedJobDescription(description);
    setCurrentJobTitle(jobTitle);
    setOpenDescriptionDialog(true);
  };

  const handleCloseDescriptionDialog = () => {
    setOpenDescriptionDialog(false);
    setSelectedJobDescription("");
    setCurrentJobTitle("");
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
        <Alert severity="error" sx={{ width: "400px" }}>
          <AlertTitle>Authentication Error</AlertTitle>
          User ID not found. Please log in again.
        </Alert>
      </Box>
    );
  }

  // if (fetchStatus === "loading" && !isRefreshing) {
  //   return (
  //     <Box sx={{ p: 3 }}>
  //       <Skeleton
  //         variant="rectangular"
  //         height={48}
  //         sx={{ mb: 2, borderRadius: 1 }}
  //       />
  //       <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
  //         {[...Array(5)].map((_, i) => (
  //           <Skeleton
  //             key={i}
  //             variant="rectangular"
  //             height={60}
  //             sx={{ borderRadius: 1 }}
  //           />
  //         ))}
  //       </Box>
  //     </Box>
  //   );
  // }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: "100%", // Full viewport width
        height: "calc(100vh - 10px)", // Full viewport height
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        p: 2,
      }}
    >
      <Fade in timeout={500}>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            height: "calc(100% - 0px)", // Take remaining height
            p: 1,
          }}
        >
          {/* <SectionHeader
            title="Assigned Requirements"
            totalCount={totalCount}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            icon={<ListAltIcon sx={{ color: "#FFF" }} />}
          /> */}

          <Box
            sx={{
              flex: 1,
              p: 1,
              display: "flex",
              flexDirection: "column",
              height: "calc(100% - 0px)", // Adjusts dynamically
              overflow: "auto",
            }}
          >
            <Box sx={{ position: "relative", flex: 1, overflow: "auto" }}>
              {isRefreshing && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: "rgba(255, 255, 255, 0.7)",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              )}

              <DataTable
                data={data}
                columns={columns}
                pageLimit={10}
                title="Assigned Profiles"
                onRefresh={fetchUserSpecificData}
                isRefreshing={isRefreshing}
                noDataMessage={
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No Records Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No requirements have been assigned yet.
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
            </Box>
          </Box>

          {/* Submit Dialog */}
          <Dialog
            open={openSubmitDialog}
            onClose={handleCloseSubmitDialog}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 2 },
            }}
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
                Submit Candidate
              </Typography>
              <IconButton
                onClick={handleCloseSubmitDialog}
                size="small"
                sx={{ color: "#FFF" }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <CandidateSubmissionForm
                jobId={selectedJobForSubmit}
                userId={user}
                userEmail={employeeEmail}
                closeDialog={handleCloseSubmitDialog}
              />
            </DialogContent>
          </Dialog>

          {/* Description Dialog */}
          <CustomDialog
            open={openDescriptionDialog}
            onClose={handleCloseDescriptionDialog}
            title={currentJobTitle}
            content={selectedJobDescription}
          />
        </Box>
      </Fade>
    </Container>
  );
};

export default Assigned;