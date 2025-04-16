import React, { useEffect, useState } from "react";
import { Box, IconButton, Tooltip, Skeleton, Chip, Typography, Stack } from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import DataTable from "../muiComponents/DataTabel";
import httpService from "../../Services/httpService";
import ToastService from "../../Services/toastService";
import ReusableExpandedContent from "../muiComponents/ReusableExpandedContent"; // Make sure this component exists
import DateRangeFilter from "../muiComponents/DateRangeFilter";
import { useSelector } from "react-redux";

const AllInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  const { isFilteredDataRequested } = useSelector((state) => state.bench);
  const {filteredInterviewList} = useSelector((state) => state.interview);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await httpService.get("/candidate/allscheduledinterviews");
      // Add temporary IDs if not present
      const dataWithIds = response.data.map((item, index) => ({
        ...item,
        interviewId: item.interviewId || `temp-${index + 1}`
      }));
      setInterviews(dataWithIds || []);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      ToastService.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    ToastService.info(`Editing interview for ${row.candidateFullName}`);
    // Implement your edit logic here
  };

  const handleDelete = async (row) => {
    try {
      const toastId = ToastService.loading("Deleting interview...");
      await httpService.delete(`/interview/${row.interviewId}`);
      await fetchInterviews();
      ToastService.update(toastId, "Interview deleted successfully", "success");
    } catch (error) {
      ToastService.error("Failed to delete interview");
    }
  };

  const toggleRowExpansion = (interviewId) => {
    setExpandedRows(prev => ({
      ...prev,
      [interviewId]: !prev[interviewId]
    }));
  };

  const getExpandedContentConfig = () => {
    return {
      title: "Interview Details",
      description: { 
        key: "notes", 
        fallback: "No additional notes available." 
      },
      backgroundColor: "#f5f5f5",
      sections: [
        {
          title: "Interview Information",
          fields: [
            { label: "Candidate Name", key: "candidateFullName", fallback: "-" },
            { label: "Candidate Email", key: "candidateEmailId", fallback: "-" },
            { label: "Contact Number", key: "candidateContactNo", fallback: "-" }
          ]
        },
        {
          title: "Schedule Details",
          fields: [
            { label: "Interview Date", key: "interviewDateTime", fallback: "-", format: (value) => new Date(value).toLocaleString() },
            { label: "Duration", key: "duration", fallback: "-", format: (value) => `${value} minutes` },
            { label: "Interview Level", key: "interviewLevel", fallback: "-" }
          ]
        },
        {
          title: "Job Information",
          fields: [
            { label: "Job ID", key: "jobId", fallback: "-" },
            { label: "Client Name", key: "clientName", fallback: "-" },
            { label: "Scheduled By", key: "userEmail", fallback: "-" }
          ]
        }
      ],
      actions: [
        {
          label: "Edit Interview",
          icon: <Edit fontSize="small" />,
          onClick: (row) => handleEdit(row),
          variant: "outlined",
          size: "small",
          color: "primary",
          sx: { mr: 1 }
        },
        {
          label: "Delete Interview",
          icon: <Delete fontSize="small" />,
          onClick: (row) => handleDelete(row),
          variant: "outlined",
          size: "small",
          color: "error"
        }
      ]
    };
  };

  const renderExpandedContent = (row) => {
    if (loading) {
      return (
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width="30%" height={100} />
            <Skeleton variant="rectangular" width="30%" height={100} />
            <Skeleton variant="rectangular" width="30%" height={100} />
          </Box>
        </Box>
      );
    }
    return <ReusableExpandedContent row={row} config={getExpandedContentConfig()} />;
  };

  const generateColumns = () => {
    const baseColumns = [
      {
        key: "interviewId",
        label: "ID",
        type: "text",
        sortable: true,
        width: 80,
        // render: (row) => loading ? (
        //   <Skeleton variant="text" width={60} height={24} />
        // ) : (
        //   `#${row.interviewId.split('-').pop()}`
        // )
      },
      {
        key: "candidateFullName",
        label: "Candidate Name",
        type: "text",
        sortable: true,
        filterable: true,
        render: (row) => loading ? (
          <Skeleton variant="text" width={120} height={24} />
        ) : (
          row.candidateFullName
        )
      },
      {
        key: "candidateContactNo",
        label: "Contact No",
        type: "text",
        sortable: true,
        filterable: true,
        render: (row) => loading ? (
          <Skeleton variant="text" width={100} height={24} />
        ) : (
          row.candidateContactNo
        )
      },
      {
        key: "interviewLevel",
        label: "Interview Level",
        type: "select",
        sortable: true,
        filterable: true,
        options: ["EXTERNAL", "INTERNAL", "HR", "Managerial", "Final"],
        render: (row) => loading ? (
          <Skeleton variant="rectangular" width={100} height={24} />
        ) : (
          <Chip 
            label={row.interviewLevel} 
            size="small" 
            variant="outlined"
          />
        )
      },
      {
        key: "interviewDateTime",
        label: "Interview Date-Time",
        type: "datetime",
        sortable: true,
        filterable: true,
        render: (row) => loading ? (
          <Skeleton variant="text" width={150} height={24} />
        ) : (
          new Date(row.interviewDateTime).toLocaleString()
        )
      },
      {
        key: "zoomLink",
        label: "Zoom Link",
        type: "link",
        sortable: false,
        filterable: false,
        render: (row) => loading ? (
          <Skeleton variant="rectangular" width={120} height={24} />
        ) : row.zoomLink ? (
          <a href={row.zoomLink} target="_blank" rel="noopener noreferrer">
            Join Meeting
          </a>
        ) : (
          <span style={{ color: '#999' }}>Not available</span>
        )
      },
      {
        key: "interviewStatus",
        label: "Status",
        type: "select",
        sortable: true,
        filterable: true,
        options: ["Scheduled", "Completed", "Cancelled", "Rescheduled"],
        render: (row) => loading ? (
          <Skeleton variant="rectangular" width={100} height={24} />
        ) : (
          <Chip
            label={row.interviewStatus || "Scheduled"}
            size="small"
            sx={{
              backgroundColor: getStatusColor(row.interviewStatus).bg,
              color: getStatusColor(row.interviewStatus).text,
              fontWeight: 500
            }}
          />
        )
      }
    ];

    const conditionalColumns = [];
    
    if (interviews.some(item => item.clientName)) {
      conditionalColumns.push({
        key: "clientName",
        label: "Client Name",
        type: "text",
        sortable: true,
        filterable: true,
        render: (row) => loading ? (
          <Skeleton variant="text" width={120} height={24} />
        ) : (
          row.clientName
        )
      });
    }

    return [
      ...baseColumns,
      ...conditionalColumns,
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        filterable: false,
        width: 180,
        align: "center",
        render: (row) => (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                color="primary"
                onClick={() => toggleRowExpansion(row.interviewId)}
                disabled={loading}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEdit(row)}
                disabled={loading}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(row)}
                disabled={loading}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    ];
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Scheduled: { bg: '#e3f2fd', text: '#1565c0' },
      Completed: { bg: '#e8f5e9', text: '#2e7d32' },
      Cancelled: { bg: '#ffebee', text: '#c62828' },
      Rescheduled: { bg: '#fff3e0', text: '#e65100' }
    };
    return statusColors[status] || { bg: '#f5f5f5', text: '#000000' };
  };

  const processedData = loading 
    ? Array(5).fill({}).map((_, index) => ({
        interviewId: `temp-${index + 1}`,
        expandContent: renderExpandedContent,
        isExpanded: expandedRows[`temp-${index + 1}`]
      }))
    : interviews.map((row) => ({
        ...row,
        expandContent: renderExpandedContent,
        isExpanded: expandedRows[row.interviewId]
      }));

  useEffect(() => {
    fetchInterviews();
  }, []);

  return (
    <>
    
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
      
              <Typography variant='h6' color='primary'>Interviews Management</Typography>
      
              <DateRangeFilter component="Interviews"/>
            </Stack>
      <DataTable
        // data={processedData}
        data={isFilteredDataRequested ?  filteredInterviewList : processedData || []}
        columns={generateColumns()}
        title="Scheduled Interviews"
        //loading={loading}
        enableSelection={false}
        defaultSortColumn="interviewDateTime"
        defaultSortDirection="desc"
        defaultRowsPerPage={10}
        customTableHeight="calc(100vh - 180px)"
        refreshData={fetchInterviews}
        primaryColor="#1976d2"
        secondaryColor="#e3f2fd"
        customStyles={{
          headerBackground: "#1976d2",
          rowHover: "#f5f5f5",
          selectedRow: "#e3f2fd",
        }}
        uniqueId="interviewId"
        enableRowExpansion={true}
        onRowExpandToggle={toggleRowExpansion}
      />
    </>
  );
};

export default AllInterviews;

