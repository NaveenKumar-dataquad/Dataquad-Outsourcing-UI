import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CircularProgress,
  Box,
  Container,
  Alert,
  AlertTitle,
} from "@mui/material";
import DataTable from "../MuiComponents/DataTable";
import SectionHeader from "../MuiComponents/SectionHeader";
import BASE_URL from "../../redux/config";

const AllSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const columns = [
    { key: "fullName", label: "Full Name", type: "text" },
    { key: "emailId", label: "Email", type: "text" },
    { key: "contactNumber", label: "Contact Number", type: "text" },
    { key: "currentOrganization", label: "Organization", type: "text" },
    { key: "qualification", label: "Qualification", type: "text" },
    { key: "totalExperience", label: "Total Exp", type: "text" },
    { key: "relevantExperience", label: "Relevant Exp", type: "text" },
    { key: "currentCTC", label: "Current CTC", type: "text" },
    { key: "expectedCTC", label: "Expected CTC", type: "text" },
    { key: "noticePeriod", label: "Notice Period", type: "select" },
    { key: "currentLocation", label: "Current Location", type: "text" },
    { key: "preferredLocation", label: "Preferred Location", type: "text" },
    { key: "skills", label: "Skills", type: "text" },
    {
      key: "communicationSkills",
      label: "Communication Skills",
      type: "select",
    },
    { key: "requiredTechnologiesRating", label: "Tech Rating", type: "text" },
    { key: "overallFeedback", label: "Overall Feedback", type: "text" },
    { key: "userEmail", label: "User Email", type: "text" },
    { key: "interviewStatus", label: "Interview Status", type: "select" },
    { key: "candidateId", label: "Candidate ID", type: "text" },
    { key: "jobId", label: "Job ID", type: "text" },
    { key: "userId", label: "User ID", type: "text" },
  ];

  const fetchSubmissions = async () => {
    setIsRefreshing(true);
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/candidate/submissions/allsubmittedcandidates`
      );
      setSubmissions(response.data);
    } catch (err) {
      setError(err.message || "Failed to load submissions");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // if (loading) {
  //   return (
  //     <Box
  //       display="flex"
  //       justifyContent="center"
  //       alignItems="center"
  //       minHeight="100vh"
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
      {/* Section Header */}
      {/* <Box sx={{ flexShrink: 0, mb: 2 }}>
        <SectionHeader
          title="Submitted Candidates"
          totalCount={submissions.length}
          onRefresh={fetchSubmissions}
          isRefreshing={isRefreshing}
        />
      </Box> */}

      {/* DataTable fills the remaining vertical space */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <DataTable
          data={submissions}
          columns={columns}
          pageLimit={10}
          title="Submitted Candidates"
          onRefresh={fetchSubmissions}
          isRefreshing={isRefreshing}
        />
      </Box>
    </Container>
  );
};

export default AllSubmissions;
