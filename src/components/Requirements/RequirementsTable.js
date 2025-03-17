import React, { useMemo, useState } from "react";
import {
  Box,
  Tooltip,
  IconButton,
  Stack,
  Button,
  Typography,
  Link,
  Card,
  CardContent,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import DataTable from "../MuiComponents/DataTable";
import axios from "axios";
import BASE_URL from "../../redux/config";
import JobDetailsLayout from "./JobDetailsLayout";
import SimpleRecruiterTable from "./SimpleRecruiterTable"; // Adjust the path
import ScheduledInterviewsTab from "./ScheduledInterviewsTab"; // Adjust the path as needed
import SubmittedCandidatesTab from "./SubmittedCandidatesTab"; // Adjust the path as needed



const RequirementsTable = ({
  requirementsList,
  handleEdit,
  handleDeleteClick,
  handleOpenDescriptionDialog,
  reloadData,
  isLoad
}) => {
  const theme = useTheme();

  // State for job details view
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [jobDetails, setJobDetails] = useState(null);

  // Function to handle job ID click
  const handleJobIdClick = async (jobId) => {
    const selectedJob = requirementsList.find((job) => job.jobId === jobId);
    if (selectedJob) {
      setJobDetails(selectedJob);
    }

    setSelectedJobId(jobId);
    setShowJobDetails(true);
    fetchJobDetails(jobId);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBackToList = () => {
    setShowJobDetails(false);
    setSelectedJobId(null);
    setJobData(null);
    setDataError(null);
  };

  const fetchJobDetails = async (jobId) => {
    setIsLoading(true);
    setDataError(null);
    try {
      const response = await axios.get(`${BASE_URL}/requirements/${jobId}`);
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
  };

  const formatHeaderText = (header) => {
    return header
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/Id$/, " ID")
      .replace(/([a-z])([A-Z])/g, "$1 $2");
  };

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
    return [];
  };

  // Sort requirementsList by requirementAddedTimeStamp in descending order
  const sortedRequirementsList = useMemo(() => {
    return [...requirementsList].sort(
      (a, b) =>
        new Date(b.requirementAddedTimeStamp) -
        new Date(a.requirementAddedTimeStamp)
    );
  }, [requirementsList]);

  
  const generateColumns = () => {
    return [
      {
        key: "jobId",
        label: "Job ID",
        type: "select",
        render: (row) => (
          <Link
            component="button"
            variant="body2"
            onClick={() => handleJobIdClick(row.jobId)}
            sx={{
              textDecoration: "none",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {row.jobId}
          </Link>
        ),
      },
      {
        key: "recruiterName",
        label: "Recruiter Name",
        type: "text",
        render: (row) =>
          row.recruiterName && Array.isArray(row.recruiterName)
            ? row.recruiterName.join(", ")
            : "N/A",
      },
      {
        key: "requirementAddedTimeStamp",
        label: "Posted Date",
        type: "select",
        render: (row) => {
          if (!row.requirementAddedTimeStamp) return "N/A";
          const date = new Date(row.requirementAddedTimeStamp);
          return isNaN(date)
            ? "Invalid Date"
            : date.toISOString().split("T")[0];
        },
      },
      // ... other columns remain unchanged
      {
        key: "jobTitle",
        label: "Job Title",
        type: "text",
        render: (row) => row.jobTitle || "N/A",
      },
      {
        key: "clientName",
        label: "Client Name",
        type: "text",
        render: (row) => row.clientName || "N/A",
      },
      {
        key: "assignedBy",
        label: "Assigned By",
        type: "text",
        render: (row) => (row.assignedBy ? row.assignedBy : "Not Assigned"),
      },
      {
        key: "jobDescription",
        label: "Job Description",
        render: (row) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {row.jobDescription ? (
              <>
                <Typography noWrap sx={{ maxWidth: 80 }}>
                  {row.jobDescription.slice(0, 15)}
                  {row.jobDescription.length > 15 && "..."}
                </Typography>
                {row.jobDescription.length > 15 && (
                  <Tooltip title="View Full Description">
                    <Button
                      onClick={() =>
                        handleOpenDescriptionDialog(
                          row.jobDescription,
                          row.jobTitle
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
              <Tooltip title="Download Job Description">
                <Link
                  href={`${BASE_URL}/requirements/download-job-description/${row.jobId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="none"
                  color="blue"
                >
                  Download JD
                </Link>
              </Tooltip>
            )}
          </Box>
        ),
      },
      {
        key: "jobType",
        label: "Job Type",
        type: "select",
        render: (row) => row.jobType || "N/A",
      },
      {
        key: "noOfPositions",
        label: "No. of Positions",
        type: "text",
        render: (row) => row.noOfPositions ?? "N/A",
      },
      {
        key: "salaryPackage",
        label: "Salary Package",
        type: "text",
        render: (row) => row.salaryPackage || "N/A",
      },
      {
        key: "jobMode",
        label: "Job Mode",
        type: "select",
        render: (row) => row.jobMode || "N/A",
      },
      {
        key: "location",
        label: "Location",
        type: "text",
        render: (row) => {
          if (!row.location) {
            return "N/A";
          }
          const locations = row.location.split(",");
          return locations.map((location, index) => (
            <React.Fragment key={index}>
              {location.trim()}
              {index < locations.length - 1 && <br />}
            </React.Fragment>
          ));
        },
      },
      {
        key: "experienceRequired",
        label: "Experience Required",
        type: "text",
        render: (row) => row.experienceRequired || "N/A",
      },
      {
        key: "relevantExperience",
        label: "Relevant Experience",
        type: "text",
        render: (row) => row.relevantExperience || "N/A",
      },
      {
        key: "noticePeriod",
        label: "Notice Period",
        type: "select",
        render: (row) => row.noticePeriod || "N/A",
      },
      {
        key: "qualification",
        label: "Qualification",
        type: "text",
        render: (row) => row.qualification || "N/A",
      },
      {
        key: "recruiterIds",
        label: "Recruiter ID",
        type: "text",
        render: (row) =>
          row.recruiterIds &&
          Array.isArray(row.recruiterIds) &&
          row.recruiterIds.length > 0
            ? row.recruiterIds.join(", ")
            : "N/A",
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        render: (row) => row.status || "N/A",
      },
      {
        key: "actions",
        label: "Actions",
        render: (row) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEdit(row)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteClick(row.jobId)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ];
  };

  const columns = useMemo(() => {
    if (sortedRequirementsList.length === 0) return [];
    return generateColumns();
  }, [
    sortedRequirementsList,
    handleEdit,
    handleDeleteClick,
    handleOpenDescriptionDialog,
  ]);

 
  const shouldExcludeFromDetailsList = (key) => {
    return [
      "recruiters",
      "submitted_Candidates",
      "interview_Scheduled_Candidates",
    ].includes(key);
  };

  // Render the job details view
  if (showJobDetails) {
    if (isLoading) {
      return (
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToList}
            variant="outlined"
            sx={{ alignSelf: "flex-start", mb: 2 }}
          >
            Back to Requirements
          </Button>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
            }}
          >
            <CircularProgress />
          </Box>
        </Box>
      );
    }

    if(isLoading){
      return(
        <Box>
          <CircularProgress />
        </Box>
      )
    }

    if (dataError) {
      return (
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToList}
            variant="outlined"
            sx={{ alignSelf: "flex-start", mb: 2 }}
          >
            Back to Requirements
          </Button>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              bgcolor: theme.palette.error.light,
              color: theme.palette.error.contrastText,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Error Loading Job Details
            </Typography>
            <Typography>{dataError}</Typography>
          </Paper>
        </Box>
      );
    }

    if (!jobData) {
      return (
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToList}
            variant="outlined"
            sx={{ alignSelf: "flex-start", mb: 2 }}
          >
            Back to Requirements
          </Button>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography>No data available for this job.</Typography>
          </Paper>
        </Box>
      );
    }

    const { recruiters, submitted_Candidates, interview_Scheduled_Candidates } =
      jobData;
    const submittedCandidateHeaders = generateTableHeaders(
      jobData.submitted_Candidates
    );
    const scheduledInterviewHeaders = generateTableHeaders(
      jobData.interview_Scheduled_Candidates
    );

    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Card sx={{ borderRadius: 0 }}>
          <CardContent >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToList}
                variant="outlined"
              >
                Back to Requirements
              </Button>
              <Typography variant="h6" fontWeight="bold">
                Job Details - {selectedJobId}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 0 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="job details tabs"
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable" // Makes tabs scrollable if width exceeds
            scrollButtons="auto" // Shows scroll buttons if needed
            sx={{
              width: "60%", // Adjusted width for better balance

              bgcolor: "white", // Background color for contrast
              borderRadius: "8px", // Smooth rounded edges
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
              ".MuiTabs-indicator": {
                height: "4px",
                borderRadius: "4px",
                backgroundColor: "#2A4DBD", // Custom color for indicator
              },
            }}
          >
            <Tab
              icon={<InfoIcon fontSize="small" />}
              iconPosition="start"
              label="Job Details"
              id="job-details-tab-0"
              aria-controls="job-details-tabpanel-0"
              sx={{
                fontSize: "0.9rem",
                fontWeight: 600,
                textTransform: "none",
                color: "#0F1C46",
                borderRadius: "8px",
                px: 3,
                "&:hover": {
                  bgcolor: "#f0f4ff", // Light blue hover effect
                },
                "&.Mui-selected": {
                  color: "#2A4DBD",
                },
              }}
            />
            <Tab
              icon={<AssignmentIcon fontSize="small" />}
              iconPosition="start"
              label="Submitted Candidates"
              id="job-details-tab-1"
              aria-controls="job-details-tabpanel-1"
              sx={{
                fontSize: "0.9rem",
                fontWeight: 600,
                textTransform: "none",
                color: "#0F1C46",
                borderRadius: "8px",
                px: 3,
                "&:hover": {
                  bgcolor: "#f0f4ff",
                },
                "&.Mui-selected": {
                  color: "#2A4DBD",
                },
              }}
            />
            <Tab
              icon={<EventIcon fontSize="small" />}
              iconPosition="start"
              label="Interviews"
              id="job-details-tab-2"
              aria-controls="job-details-tabpanel-2"
              sx={{
                fontSize: "0.9rem",
                fontWeight: 600,
                textTransform: "none",
                color: "#0F1C46",
                borderRadius: "8px",
                px: 3,
                "&:hover": {
                  bgcolor: "#f0f4ff",
                },
                "&.Mui-selected": {
                  color: "#2A4DBD",
                },
              }}
            />
            <Tab
              icon={<PersonIcon fontSize="small" />}
              iconPosition="start"
              label="Recruiters"
              id="job-details-tab-3"
              aria-controls="job-details-tabpanel-3"
              sx={{
                fontSize: "0.9rem",
                fontWeight: 600,
                textTransform: "none",
                color: "#0F1C46",
                borderRadius: "8px",
                px: 3,
                "&:hover": {
                  bgcolor: "#f0f4ff",
                },
                "&.Mui-selected": {
                  color: "#2A4DBD",
                },
              }}
            />
          </Tabs>

          <Box
            sx={{
              p: 3,
              bgcolor: theme.palette.grey[50],
              maxHeight: "70vh",
              overflow: "auto",
            }}
          >
            <SimpleRecruiterTable
              tabValue={tabValue}
              recruiters={recruiters}
              formatHeaderText={formatHeaderText}
            />

            {/* Full Job Details Tab */}
            <Box
              role="tabpanel"
              hidden={tabValue !== 0}
              id="job-details-tabpanel-0"
              aria-labelledby="job-details-tab-0"
            >
              {tabValue === 0 && jobDetails ? (
               <JobDetailsLayout jobDetails={jobDetails}  />
              ) : (
                <Typography sx={{ p: 3 }}>No job details available.</Typography>
              )}
            </Box>

            {/* Submitted Candidates Tab */}
            <SubmittedCandidatesTab
              tabValue={tabValue}
              submitted_Candidates={submitted_Candidates}
            />

            {/* Scheduled Interviews Tab */}
            <ScheduledInterviewsTab
              tabValue={tabValue}
              interview_Scheduled_Candidates={interview_Scheduled_Candidates}
            />
          </Box>
        </Paper>
      </Box>
    );
  }

  // Return the main requirements table
  return (
    <DataTable
      data={sortedRequirementsList}
      columns={columns}
      title="Requirements List"
      emptyMessage="No requirements found. Add new requirements to get started."
      onRefresh={reloadData}
      isRefreshing={isLoad}
    />
  );
};

export default RequirementsTable;
