import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  Drawer,
  Link,
  Typography,
  Skeleton,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import { Download, Edit, Delete } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import DataTable from "../muiComponents/DataTabel";
import CandidateSubmissionDrawer from "../Assigned/CandidateSubmissionDrawer";
import ScheduleInterviewForm from "./ScheduleInterviewForm";
import httpService from "../../Services/httpService";
import { useSelector } from "react-redux";
import DateRangeFilter from "../muiComponents/DateRangeFilter";

const Submission = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [candidateData, setCandidateData] = useState(null);
  const [mode, setMode] = useState("add");
  const [moveToBenchLoading, setMoveToBenchLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const { isFilteredDataRequested } = useSelector((state) => state.bench);
  const { filteredSubmissionsForRecruiter } = useSelector((state) => state.submission);

  console.log("Filtered Recruiter Data: ", filteredSubmissionsForRecruiter);
  

  const { userId } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await httpService.get(`/candidate/submissions/${userId}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching candidate submissions:", error);
      showSnackbar("Failed to fetch submissions", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleMoveToBench = async (row, e) => {
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to move ${row.fullName} to the bench?`)) {
      try {
        setMoveToBenchLoading(true);
        
        // Create FormData for the bench request
        const formData = new FormData();
        formData.append("fullName", row.fullName);
        formData.append("email", row.emailId);
        formData.append("contactNumber", row.contactNumber);
        formData.append("relevantExperience", row.relevantExperience || "");
        formData.append("totalExperience", row.totalExperience || "");
        
        // Convert skills array to JSON string if needed
        if (Array.isArray(row.skills)) {
          formData.append("skills", JSON.stringify(row.skills));
        } else if (typeof row.skills === 'string') {
          // If skills is already a string, split it and convert to JSON
          const skillsArray = row.skills.split(',').map(skill => skill.trim());
          formData.append("skills", JSON.stringify(skillsArray));
        } else {
          // If skills is null or undefined, send empty array
          formData.append("skills", JSON.stringify([]));
        }
        
        formData.append("linkedin", row.linkedin || "");
        formData.append("referredBy", row.userEmail || "");
        
        // Fetch resume using the correct endpoint
        try {
          const response = await httpService.get(`/candidate/download-resume/${row.candidateId}`, {
            responseType: "blob",
          });
          
          // Get file name from content-disposition or create a default one
          const fileName = response.headers["content-disposition"]
            ? response.headers["content-disposition"].split("filename=")[1]
            : `resume_${row.candidateId}.pdf`;
          
          // Create a file from the blob
          const contentType = response.headers["content-type"];
          const file = new File([response.data], fileName, { type: contentType });
          
          // Use the correct field name for the API
          formData.append("resumeFiles", file);
        } catch (error) {
          console.error("Error fetching resume:", error);
          // Continue with the bench submission even if resume fetch fails
        }
        
        // Send to bench endpoint
        await httpService.post('/candidate/bench/save', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Remove from current list
        setData(data.filter(item => item.candidateId !== row.candidateId));
        
        showSnackbar(`${row.fullName} has been moved to the bench successfully!`);
      } catch (error) {
        console.error("Error moving candidate to bench:", error);
        showSnackbar("Failed to move candidate to bench. Please try again.", "error");
      } finally {
        setMoveToBenchLoading(false);
      }
    }
  };

  const downloadResume = async (candidateId, e) => {
    e.stopPropagation();
  
    try {
      setDownloadLoading(true);
  
      const response = await httpService.get(`/candidate/download-resume/${candidateId}`, {
        responseType: "blob",
      });
  
      if (!response || !response.data) {
        throw new Error("No resume file received.");
      }
  
      // Detect content type and assign proper extension
      const contentType = response.headers["content-type"];
      const extension =
        contentType === "application/pdf"
          ? ".pdf"
          : contentType === "application/msword"
          ? ".doc"
          : contentType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ? ".docx"
          : ".pdf"; // fallback
  
      const filename = `resume_${candidateId}${extension}`;
      const blob = new Blob([response.data], { type: contentType });
      const url = URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resume:", error);
      showSnackbar("Failed to download resume", "error");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleEdit = (row, e) => {
    e.stopPropagation();
    setCandidateData(row);
    setMode("edit");
    setOpenDrawer(true);
  };

  const handleDelete = async (candidateId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await httpService.delete(`/candidate/${candidateId}`);
        fetchData();
        showSnackbar("Candidate deleted successfully");
      } catch (error) {
        console.error("Error deleting candidate:", error);
        showSnackbar("Failed to delete candidate", "error");
      }
    }
  };

  const openNewCandidateDrawer = () => {
    setCandidateData(null);
    setMode("add");
    setOpenDrawer(true);
  };

  const closeDrawer = () => {
    setOpenDrawer(false);
  };

  const openScheduleDrawer = (row, e) => {
    e.stopPropagation();
    setScheduleData(row);
    setScheduleDrawerOpen(true);
  };

  const closeScheduleDrawer = () => {
    setScheduleDrawerOpen(false);
  };

  const generateColumns = (loading = false) => [
    {
      key: "candidateId",
      label: "Candidate ID",
      type: "text",
      sortable: true,
      filterable: true,
      width: 120,
      render: loading ? () => <Skeleton variant="text" width={80} /> : (row) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: 'primary.main',
            fontFamily: 'monospace'
          }}
        >
          {row.candidateId}
        </Typography>
      )
    },
    {
      key: "fullName",
      label: "Full Name",
      type: "text",
      sortable: true,
      filterable: true,
      width: 180,
      render: loading ? () => <Skeleton variant="text" width={120} /> : (row) => (
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 450,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {row.fullName}
        </Typography>
      )
    },
    {
      key: "clientName",
      label: "Client",
      type: "text",
      sortable: true,
      filterable: true,
      width: 180,
      render: loading ? () => <Skeleton variant="text" width={100} /> : (row) => (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <BusinessIcon fontSize="small" color="action" />
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            {row.clientName}
          </Typography>
        </Box>
      )
    },
    {
      key: "emailId",
      label: "Email",
      type: "text",
      sortable: true,
      filterable: true,
      width: 220,
      render: loading ? () => <Skeleton variant="text" width={180} /> : (row) => (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <EmailIcon fontSize="small" color="action" />
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'secondary.main',
              textDecoration: 'underline',
              cursor: 'pointer',
              '&:hover': { color: 'secondary.dark' }
            }}
            onClick={() => window.location.href = `mailto:${row.emailId}`}
          >
            {row.emailId}
          </Typography>
        </Box>
      )
    },
    {
      key: "contactNumber",
      label: "Contact",
      type: "text",
      sortable: true,
      filterable: true,
      width: 120,
      render: loading ? () => <Skeleton variant="text" width={80} /> : (row) => (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <PhoneIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {row.contactNumber}
          </Typography>
        </Box>
      )
    },
    {
      key: "jobId",
      label: "Job ID",
      type: "text",
      sortable: true,
      filterable: true,
      width: 100,
      render: loading ? () => <Skeleton variant="text" width={60} /> : (row) => (
        <Chip 
          label={row.jobId} 
          size="small" 
          color="info"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      )
    },
    {
      key: "interviewStatus",
      label: "Status",
      type: "select",
      sortable: true,
      filterable: true,
      width: 120,
      options: [
        "selected",
        "rejected",
        "pending",
        "interviewed",
        "cancelled",
        "not scheduled",
      ],
      render: loading ? () => <Skeleton variant="text" width={80} /> : (row) => {
        const statusColors = {
          selected: { bg: '#e8f5e9', color: '#2e7d32' },
          rejected: { bg: '#ffebee', color: '#c62828' },
          pending: { bg: '#fff8e1', color: '#f57f17' },
          interviewed: { bg: '#e3f2fd', color: '#1565c0' },
          cancelled: { bg: '#efebe9', color: '#4e342e' },
          "not scheduled": { bg: '#f5f5f5', color: '#424242' }
        };
        
        return (
          <Chip
            label={row.interviewStatus}
            size="small"
            sx={{ 
              backgroundColor: statusColors[row.interviewStatus]?.bg || '#f5f5f5',
              color: statusColors[row.interviewStatus]?.color || '#424242',
              fontWeight: 500,
              textTransform: 'capitalize',
              width: '100%',
              maxWidth: '100px'
            }}
          />
        );
      }
    },
    {
      key: "moveToBench",
      label: "Move to Bench",
      sortable: false,
      filterable: false,
      width: 130,
      align: "center",
      render: loading ? () => <Skeleton variant="text" width={100} /> : (row) => (
        <Button
          variant="outlined"
          size="small"
          color="secondary"
          onClick={(e) => handleMoveToBench(row, e)}
          disabled={moveToBenchLoading}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            '&:hover': {
              backgroundColor: 'secondary.light',
              color: 'secondary.contrastText'
            }
          }}
        >
          {moveToBenchLoading ? <CircularProgress size={20} /> : 'To Bench'}
        </Button>
      ),
    },
    {
      key: "schedule",
      label: "Schedule Interview",
      sortable: false,
      filterable: false,
      width: 160,
      align: "center",
      render: loading ? () => <Skeleton variant="text" width={120} /> : (row) => (
        <Button
          variant="outlined"
          size="small"
          color="primary"
          startIcon={<CalendarTodayIcon fontSize="small" />}
          onClick={(e) => openScheduleDrawer(row, e)}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
            py: 0.5
          }}
        >
          Schedule
        </Button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      filterable: false,
      width: 150,
      align: "center",
      render: loading ? () => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="circular" width={32} height={32} />
          ))}
        </Box>
      ) : (row) => (
        <Box
          sx={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: 1,
            '& .MuiIconButton-root': {
              backgroundColor: 'action.hover',
              '&:hover': {
                backgroundColor: 'action.selected'
              }
            }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="Download Resume">
            <IconButton
              size="small"
              onClick={(e) => downloadResume(row.candidateId, e)}
              disabled={downloadLoading}
              sx={{ color: 'success.main' }}
            >
              {downloadLoading ? (
                <CircularProgress size={16} />
              ) : (
                <Download fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Candidate">
            <IconButton
              size="small"
              onClick={(e) => handleEdit(row, e)}
              sx={{ color: 'info.main' }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Candidate">
            <IconButton
              size="small"
              onClick={(e) => handleDelete(row.candidateId, e)}
              sx={{ color: 'error.main' }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const columns = generateColumns(loading);

  return (
    <div>
       <Stack direction="row" alignItems="center" spacing={2}
        sx={{
          flexWrap: 'wrap',
          mb: 3,
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: '#f9f9f9',
          borderRadius: 2,
          boxShadow: 1,

        }}>

        <Typography variant='h6' color='primary'>Submissions List</Typography>

        <DateRangeFilter component="RecruiterSubmission" />
      </Stack>
      
      <DataTable
        data={isFilteredDataRequested ? filteredSubmissionsForRecruiter : data || []} 
        columns={columns}
        title="Candidate Submissions"
        enableSelection={false}
        defaultSortColumn="candidateId"
        defaultSortDirection="desc"
        defaultRowsPerPage={10}
        customTableHeight={650}
        refreshData={fetchData}
        primaryColor="#00796b"
        secondaryColor="#e0f2f1"
        customStyles={{
          headerBackground: "#1976d2",
          rowHover: "#e0f2f1",
          selectedRow: "#b2dfdb",
        }}
        onAddNew={openNewCandidateDrawer}
        uniqueId="candidateId"
      />

      <Drawer anchor="right" open={openDrawer} onClose={closeDrawer}>
        <CandidateSubmissionDrawer
          candidateData={candidateData}
          setCandidateData={setCandidateData}
          onClose={closeDrawer}
          mode={mode}
          refreshData={fetchData}
          userId={userId}
        />
      </Drawer>

      <Drawer
        anchor="right"
        open={scheduleDrawerOpen}
        onClose={closeScheduleDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 500, md: 500, lg: 600 },
            p: 2,
            pt: 0,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
            boxShadow: 3,
            backgroundColor: "#fafafa",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Schedule Interview
          </Typography>
          <IconButton onClick={closeScheduleDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            px: 2,
            pb: 4,
            pt: 1,
            overflowY: "auto",
            height: "calc(100% - 60px)",
          }}
        >
          <ScheduleInterviewForm
            data={scheduleData}
            onClose={closeScheduleDrawer}
            refreshData={fetchData} 
          />
        </Box>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Submission;