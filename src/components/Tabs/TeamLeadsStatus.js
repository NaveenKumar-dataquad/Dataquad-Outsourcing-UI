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

const TeamLeadDetailsView = ({ teamLeadData }) => {
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

  const flattenPlacements = () => {
    if (!teamLeadData.placements) return [];
    return Object.entries(teamLeadData.placements).flatMap(([client, placements]) => 
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
            {activeTab === 0 && teamLeadData.jobDetails && (
              <ReusableTable
                columns={jobColumns}
                data={Object.values(teamLeadData.jobDetails).flat()}
              />
            )}

            {activeTab === 1 && teamLeadData.submittedCandidates && (
              <ReusableTable
                columns={candidateColumns}
                data={teamLeadData.submittedCandidates}
              />
            )}

            {activeTab === 2 && teamLeadData.scheduledInterviews && (
              <ReusableTable
                columns={interviewColumns}
                data={teamLeadData.scheduledInterviews}
              />
            )}

            {activeTab === 3 && teamLeadData.placements && (
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

const TeamLeadsStatus = () => {
  const [teamLeadsData, setTeamLeadsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTeamLead, setSelectedTeamLead] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUserSpecificData = async () => {
    setIsRefreshing(true);
    try {
      const response = await axios.get(`${BASE_URL}/requirements/stats`);
      // Filter for TEAMLEAD role only
      const teamLeads = response.data.filter(user => user.role === "TEAMLEAD");
      setTeamLeadsData(teamLeads);
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
      setSelectedTeamLead(response.data);
    } catch (error) {
      console.error("Error fetching team lead details:", error);
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
    { key: "employeeEmail", label: "Email" },
    { key: "numberOfSubmissions", label: "Submissions" },
    { key: "numberOfInterviews", label: "Interviews" },
    { key: "numberOfPlacements", label: "Placements" }
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
          {!selectedTeamLead && !detailLoading && (
            <Grid item xs={12}>
              <DataTable
                data={teamLeadsData}
                columns={mainTableColumns}
                pageLimit={20}
                title="Team Leads Status"
                onRefresh={fetchUserSpecificData}
                isRefreshing={isRefreshing}
                noDataMessage={
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Team Leads Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No team leads are currently registered in the system.
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

          {selectedTeamLead && !detailLoading && (
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
                  onClick={() => setSelectedTeamLead(null)}
                  sx={{ minWidth: 140 }}
                >
                  Back to Team Leads
                </Button>
              </Box>

              <TeamLeadDetailsView teamLeadData={selectedTeamLead} />
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default TeamLeadsStatus;