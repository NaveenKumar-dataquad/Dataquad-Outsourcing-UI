import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CircularProgress,
  Box,
  Paper,
  Container,
  Alert,
  AlertTitle,
} from "@mui/material";
import BASE_URL from "../../redux/config";
import DataTable from "../MuiComponents/DataTable"; // Reusable DataTable component
import SectionHeader from "../MuiComponents/SectionHeader"; // Import the reusable SectionHeader

const AllInterviews = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Fetch interview submissions
  const fetchSubmissions = async () => {
    setIsRefreshing(true);
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/candidate/allscheduledinterviews`
      );
      setSubmissions(response.data);
    } catch (err) {
      setError(err.message || "Failed to load submissions");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Custom column order
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
    { key: "interviewStatus", label: "Interview Status", type: "select" }
  ];

  // Generate columns dynamically with manual order
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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

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
          maxWidth={false}        // 1) No fixed max width
          disableGutters         // 2) Remove horizontal padding
          sx={{
            width: "100%",       // Fill entire viewport width
            height: "calc(100vh - 20px)",  // Fill entire viewport height
            display: "flex",
            flexDirection: "column",
            p: 2,
          }}
        >
      {/* Reusable SectionHeader */}
      <Box sx={{mb:1}}> 
        <SectionHeader
          title="Scheduled Interviews"
          totalCount={submissions.length}
          onRefresh={fetchSubmissions}
          isRefreshing={isRefreshing}
        />
      </Box>

      {/* Reusing DataTable component */}
      <DataTable data={submissions} columns={columnsAll} pageLimit={10} />
    </Container>
  );
};

export default AllInterviews;
