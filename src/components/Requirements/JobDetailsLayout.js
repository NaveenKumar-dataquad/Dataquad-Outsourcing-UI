import React from "react";
import {
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Card,
  CardContent,
  Divider,
  useTheme,
  Link,
  Tooltip,
  Button,
} from "@mui/material";
import { Description as DescriptionIcon } from "@mui/icons-material";

const JobDetailsLayout = ({ jobDetails, BASE_URL }) => {
  const theme = useTheme();

  const formatHeaderText = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/Id$/, " ID")
      .replace(/([a-z])([A-Z])/g, "$1 $2");
  };

  const detailOrder = [
    "assignedBy",
    "requirementAddedTimeStamp",
    "recruiterName",
   "status",
    "jobTitle",
    "clientName",
    "location",
    "jobMode",
    "jobType",
    "qualification",
    "experienceRequired",
    "relevantExperience",
    "salaryPackage",
    "noOfPositions",
    "noticePeriod",
    "recruiterIds",
    "jobId",
    
  ];

  const orderedDetails = detailOrder.map((key) => {
    if (jobDetails && jobDetails.hasOwnProperty(key)) {
      let value = jobDetails[key];
  
      // ✅ Convert `requirementAddedTimeStamp` to YYYY-MM-DD format
      if (key === "requirementAddedTimeStamp" && value) {
        value = new Date(value).toISOString().split("T")[0]; // Extract YYYY-MM-DD
      }
  
      return [key, value];
    }
    return [key, "N/A"];
  });

  // ✅ Function to Download jobDescriptionBlob as a File
  const handleDownloadBlob = () => {
    if (jobDetails?.jobDescriptionBlob) {
      const blobData = atob(jobDetails.jobDescriptionBlob); // Decode Base64
      const byteArray = new Uint8Array(blobData.length);
      for (let i = 0; i < blobData.length; i++) {
        byteArray[i] = blobData.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      // ✅ Set filename using Job Title (fallback to "Job_Description.pdf" if jobTitle is missing)
      const fileName = jobDetails?.jobTitle
        ? jobDetails.jobTitle.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_") + ".pdf"
        : "Job_Description.pdf";

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Grid container spacing={2} sx={{ height: "60vh", overflow: "auto" }}>
      {/* Job Details Table */}
      <Grid item xs={12} md={6}>
        <Card elevation={2} sx={{ borderRadius: "12px 12px 0 0" }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ bgcolor: theme.palette.info.light, p: 2 }}>
              <Typography
                variant="h5" // ✅ Increased Font Size for Header
                fontWeight="bold"
                color={theme.palette.info.contrastText}
              >
                Job Details
              </Typography>
            </Box>
            <TableContainer>
              <Table size="medium"> {/* ✅ Increased Table Size */}
                <TableBody>
                  {orderedDetails.map(([key, value]) => (
                    <TableRow
                      key={key}
                      sx={{
                        "&:nth-of-type(odd)": {
                          bgcolor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1rem", // ✅ Increased Font Size
                        }}
                      >
                        {formatHeaderText(key)}
                      </TableCell>
                      <TableCell sx={{ fontSize: "1rem" }}>
                        {Array.isArray(value)
                          ? value.join(", ")
                          : typeof value === "object" && value !== null
                          ? Object.values(value).join(", ")
                          : value || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Job Description Section */}
      <Grid item xs={12} md={6}>
        <Card
          elevation={2}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <CardContent sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <DescriptionIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h5" fontWeight="bold" color="primary">
                Job Description
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Job Description Content */}
            <Box
              sx={{
                overflowY: "auto",
                padding: 2,
                bgcolor: "#f9f9f9",
                borderRadius: "8px",
                whiteSpace: "pre-line",
                lineHeight: 1.5,
                fontSize: "1rem", // ✅ Increased Font Size
              }}
            >
              {jobDetails?.jobDescription ? (
                // ✅ Use jobDescription if it's available
                <Typography sx={{ fontSize: "1rem" }}>
                  {jobDetails.jobDescription}
                </Typography>
              ) : jobDetails?.jobDescriptionBlob ? (
                // ✅ Show "Download JD" button for Blob data
                <Tooltip title="Download Job Description">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDownloadBlob}
                    sx={{ fontSize: "1rem", padding: "10px 20px" }} // ✅ Increased Button Size
                  >
                    Download JD
                  </Button>
                </Tooltip>
              ) : (
               
                <Typography sx={{ fontSize: "1rem" }}>
                  No job description available.
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default JobDetailsLayout;
