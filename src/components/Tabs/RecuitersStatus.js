import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Link,
  Button,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import DataTable from "../MuiComponents/DataTable";
import ReusableTable from "../Bdm/DetailsBdm/ReusableTable";
import BASE_URL from "../../redux/config";

const RecruiterDetailsView = ({ recruiterData }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setLoading(true);
    setActiveTab(newValue);
    setTimeout(() => setLoading(false), 300);
  };

  const candidateColumns = [
    { key: "fullName", label: "Candidate Name" },
    { key: "candidateEmailId", label: "Email" },
    { key: "contactNumber", label: "Contact Number" },
    { key: "candidateId", label: "Candidate ID" },
    { key: "jobTitle", label: "Job Title" },
    { key: "jobId", label: "Job ID" },
    { key: "clientName", label: "Client Name" },
    { key: "skills", label: "Skills" },
    { key: "qualification", label: "Qualification" },
    {
      key: "overallFeedback",
      label: "Feedback",
      render: (feedback) =>
        feedback ? feedback.split(",").map((item, index) => <div key={index}>{item.trim()}</div>) : "—"
    }
  ];
  
  const interviewColumns = [
    { key: "fullName", label: "Candidate Name" },
    { key: "candidateEmailId", label: "Candidate Email" },
    { key: "contactNumber", label: "Contact Number" },
    { key: "jobId", label: "Job ID" },
    { key: "jobTitle", label: "Job Title" },
    { key: "clientName", label: "Client Name" },
    { key: "skills", label: "Skills" },
    { key: "qualification", label: "Qualification" },
    { key: "interviewStatus", label: "Interview Status" },
    { key: "interviewLevel", label: "Interview Level" },
    { 
      key: "interviewDateTime", 
      label: "Interview Date",
      render: (value) => value ? new Date(value).toISOString().split('T')[0] : '—' 
    }
  ];
  
  const jobColumns = [
    { key: "jobId", label: "Job ID" },
    { key: "jobTitle", label: "Job Title" },
    { key: "clientName", label: "Client" },
    { key: "jobType", label: "Job Type" },
    { key: "jobMode", label: "Job Mode" },
    { key: "noOfPositions", label: "No. of Positions" },
    { key: "qualification", label: "Qualification" },
    { 
      key: "postedDate", 
      label: "Posted Date",
      render: (value) => value ? new Date(value).toISOString().split('T')[0] : '—' 
    },
    { key: "assignedBy", label: "Assigned By" },
    { key: "status", label: "Status" }
  ];

  const placementColumns = [
    { key: "fullName", label: "Candidate Name" },
    { key: "clientName", label: "Client" },
    { key: "jobTitle", label: "Job Title" },
    { key: "jobId", label: "Job ID" },
    { key: "qualification", label: "Qualification" },
    { key: "skills", label: "Skills" },
    { key: "interviewDateTime", label: "Placement Date" },
    { key: "candidateEmailId", label: "Email" },
    { key: "contactNumber", label: "Contact" }
  ];

  // Flatten submitted candidates from object to array
  const flattenSubmittedCandidates = () => {
    if (!recruiterData.submittedCandidates) return [];
    return Object.entries(recruiterData.submittedCandidates).flatMap(
      ([client, candidates]) => 
        candidates.map(candidate => ({ 
          ...candidate, 
          clientName: client // Ensure clientName is set from the parent key
        }))
    );
  };

  // Flatten interviews data
  const flattenInterviews = () => {
    if (!recruiterData.scheduledInterviews) return [];
    if (Array.isArray(recruiterData.scheduledInterviews)) {
      return recruiterData.scheduledInterviews;
    }
    return Object.values(recruiterData.scheduledInterviews).flat();
  };

  // Flatten job details data
  const flattenJobDetails = () => {
    if (!recruiterData.jobDetails) return [];
    return Object.values(recruiterData.jobDetails).flat();
  };

  // Flatten placements data
  const flattenPlacements = () => {
    if (!recruiterData.placements) return [];
    return Object.entries(recruiterData.placements).flatMap(
      ([client, placements]) => 
        placements.map(placement => ({ 
          ...placement, 
          clientName: client 
        }))
    );
  };

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          width: "60%",
          bgcolor: "white",
          borderRadius: "8px",
          ".MuiTabs-indicator": {
            height: "4px",
            borderRadius: "4px",
            backgroundColor: "#2A4DBD",
          },
        }}
      >
        <Tab label="Job Details" />
        <Tab label="Submitted Candidates" />
        <Tab label="Interviews" />
        <Tab label="Placements" />
      </Tabs>

      <Box p={3}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="50vh"
          >
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <>
            {activeTab === 0 && (
              <ReusableTable
                columns={jobColumns}
                data={flattenJobDetails()}
              />
            )}

            {activeTab === 1 && (
              <ReusableTable
                columns={candidateColumns}
                data={flattenSubmittedCandidates()}
              />
            )}

            {activeTab === 2 && (
              <ReusableTable
                columns={interviewColumns}
                data={flattenInterviews()}
              />
            )}

            {activeTab === 3 && (
              <ReusableTable
                columns={placementColumns}
                data={flattenPlacements()}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

const RecruitersStatus = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUserSpecificData = async () => {
    setIsRefreshing(true);
    try {
      const response = await axios.get(`${BASE_URL}/requirements/stats`);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSpecificData();
  }, []);

  const handleEmployeeIdClick = async (employeeId) => {
    setDetailLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/requirements/list/${employeeId}`
      );
      setSelectedRecruiter(response.data);
    } catch (error) {
      console.error("Error fetching recruiter details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const mainTableColumns = [
    {
      key: "employeeId",
      label: "Employee ID",
      render: (row) => (
        <Link
          component="button"
          variant="body2"
          onClick={() => handleEmployeeIdClick(row.employeeId)}
          sx={{
            textDecoration: "underline",
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {row.employeeId}
        </Link>
      ),
    },
    { key: "employeeName", label: "Name" },
    { key: "role", label: "Role" },
    { key: "numberOfSubmissions", label: "Submissions" },
    { key: "numberOfInterviews", label: "Interviews" },
    { key: "numberOfPlacements", label: "Placements" },
  ];

  return (
    <Box>
      {isLoading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading data...
          </Typography>
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: "center", py: 4 }}>
          {error}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {!selectedRecruiter && !detailLoading && (
            <Grid item xs={12}>
              <DataTable
                data={data}
                columns={mainTableColumns}
                pageLimit={20}
                title="Recruiters Status"
                onRefresh={fetchUserSpecificData}
                isRefreshing={isRefreshing}
                noDataMessage={
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
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
            </Grid>
          )}

          {detailLoading && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="50vh"
              width="100%"
            >
              <CircularProgress color="primary" />
            </Box>
          )}

          {selectedRecruiter && !detailLoading && (
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                sx={{ gap: 2 }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ArrowBack />}
                  onClick={() => setSelectedRecruiter(null)}
                  sx={{ minWidth: 140 }}
                >
                  Back to Recruiters
                </Button>
              </Box>

              <RecruiterDetailsView recruiterData={selectedRecruiter} />
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default RecruitersStatus;