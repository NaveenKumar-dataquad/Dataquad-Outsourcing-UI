import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CircularProgress,
  Box,
  Paper,
  Container,
  Alert,
  AlertTitle,
  ButtonGroup,
  Button,
  Typography,
} from "@mui/material";
import BASE_URL from "../../redux/config";
import DataTable from "../MuiComponents/DataTable";
import SectionHeader from "../MuiComponents/SectionHeader";

const AllInterviews = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setIsRefreshing(true);
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/candidate/allscheduledinterviews`
      );
      setSubmissions(response.data);
      setFilteredSubmissions(response.data);
    } catch (err) {
      setError(err.message || "Failed to load submissions");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const getInterviewLevels = () => {
    if (!submissions.length) return [];

    const levels = submissions
      .map((item) => item.interviewLevel)
      .filter((level) => level !== null && level !== undefined && level !== "");

    const uniqueLevels = {};

    levels.forEach((level) => {
      const lowerCaseLevel = level.toLowerCase();
      uniqueLevels[lowerCaseLevel] = level;
    });

    return ["All", ...Object.values(uniqueLevels)];
  };

  const handleFilterChange = (level) => {
    setActiveFilter(level);
    if (level === "All") {
      setFilteredSubmissions(submissions);
    } else {
      setFilteredSubmissions(
        submissions.filter(
          (item) => item.interviewLevel.toLowerCase() === level.toLowerCase()
        )
      );
    }
  };

  const columnOrder = [
    "candidateFullName",
    "candidateContactNo",
    "candidateEmailId",
    "userEmail",
    "userId",
    "interviewDateTime",
    "duration",
    "zoomLink",
    "jobId",
    "candidateId",
    "interviewScheduledTimestamp",
    "clientEmail",
    "clientName",
    "interviewLevel",
    "interviewStatus",
  ];

  const columnsAll = [
    { key: "candidateFullName", label: "Candidate FullName", type: "text" },
    { key: "candidateContactNo", label: "Candidate ContactNumber", type: "text" },
    { key: "candidateEmailId", label: "Candidate EmailID", type: "text" },
    { key: "userEmail", label: "User Email", type: "text" },
    { key: "userId", label: "User ID", type: "text" },
    { key: "interviewDateTime", label: "Interview Date-Time", type: "datetime" },
    { key: "duration", label: "Duration", type: "text" },
    { key: "zoomLink", label: "Zoom Link", type: "link" },
    { key: "jobId", label: "Job ID", type: "text" },
    { key: "candidateId", label: "Candidate ID", type: "text" },
    { key: "interviewScheduledTimestamp", label: "Interview Scheduled Timestamp", type: "datetime" },
    { key: "clientEmail", label: "Client Email", type: "text" },
    { key: "clientName", label: "Client Name", type: "text" },
    { key: "interviewLevel", label: "Interview Level", type: "select" },
    { key: "interviewStatus", label: "Interview Status", type: "select" },
  ];

  const generateColumns = (data, order) => {
    if (!data.length) return [];
    return order.map((key) => ({
      key,
      label: key
        .split(/(?=[A-Z])/)
        .join(" ")
        .replace(/^./, (str) => str.toUpperCase()),
    }));
  };

  const columns = generateColumns(submissions, columnOrder);

  // if (loading) {
  //   return (
  //     <Box
  //       display="flex"
  //       justifyContent="center"
  //       alignItems="center"
  //       minHeight="400px"
  //     >
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: "100%",
        height: "calc(100vh - 20px)",
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      {/* <Box sx={{ mb: 1 }}>
        <SectionHeader
          title="Scheduled Interviews"
          totalCount={filteredSubmissions.length}
          onRefresh={fetchSubmissions}
          isRefreshing={isRefreshing}
        />
      </Box> */}

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Filter by Interview Level:
        </Typography>
        <Paper elevation={0} sx={{ p: 1, backgroundColor: "#f5f5f5" }}>
          <ButtonGroup
            variant="outlined"
            size="small"
            aria-label="interview level filter"
          >
            {getInterviewLevels().map((level) => (
              <Button
                key={level}
                onClick={() => handleFilterChange(level)}
                variant={activeFilter === level ? "contained" : "outlined"}
                color="primary"
              >
                {level}
              </Button>
            ))}
          </ButtonGroup>
        </Paper>
      </Box>

      <DataTable
        data={filteredSubmissions}
        columns={columnsAll}
        pageLimit={10}
        title="Interviews"
        onRefresh={fetchSubmissions}
        isRefreshing={isRefreshing}
      />
    </Container>
  );
};

export default AllInterviews;