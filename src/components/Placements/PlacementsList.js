import React from "react";
import { Box, Typography, Button } from "@mui/material";
import DataTable from "../MuiComponents/DataTable"; // Adjust the path if needed

const PlacementsList = () => {
  const filteredData = [
    {
      employeeId: "SEL201",
      userName: "Rahul Sharma",
      roles: "Frontend Developer",
      email: "rahul.sharma@jobportal.com",
      designation: "React Developer",
      joiningDate: "2025-05-10",
      gender: "Male",
      dob: "1998-07-12",
      phoneNumber: "9876543102",
      personalemail: "rahul.sharma@gmail.com",
      status: "Selected",
      companyName: "Capgemini",
      location: "Gurgaon",
      package: "6.2 LPA",
    },
    {
      employeeId: "SEL202",
      userName: "Sneha Kulkarni",
      roles: "Backend Developer",
      email: "sneha.kulkarni@jobportal.com",
      designation: "Spring Boot Developer",
      joiningDate: "2025-05-15",
      gender: "Female",
      dob: "1997-03-22",
      phoneNumber: "9012987654",
      personalemail: "sneha.kulkarni@gmail.com",
      status: "Selected",
      companyName: "Tech Mahindra",
      location: "Chennai",
      package: "6.8 LPA",
    },
    {
      employeeId: "SEL203",
      userName: "Aditya Verma",
      roles: "Full Stack Developer",
      email: "aditya.verma@jobportal.com",
      designation: "MERN Stack Developer",
      joiningDate: "2025-06-01",
      gender: "Male",
      dob: "1996-12-15",
      phoneNumber: "9988776655",
      personalemail: "aditya.verma@gmail.com",
      status: "Selected",
      companyName: "HCL",
      location: "Noida",
      package: "7.5 LPA",
    },
  ];

  const renderActionsColumn = (row) => (
    <Button variant="contained" size="small" onClick={() => alert(`Follow-up with ${row.userName}`)}>
      Follow Up
    </Button>
  );

  const columns = [
    { key: "employeeId", label: "Candidate ID", type: "text" },
    { key: "userName", label: "Candidate Name", type: "text" },
    { key: "roles", label: "Role", type: "text" },
    { key: "designation", label: "Designation", type: "text" },
    { key: "email", label: "Official Email", type: "text" },
    { key: "personalemail", label: "Personal Email", type: "text" },
    { key: "phoneNumber", label: "Phone Number", type: "text" },
    { key: "gender", label: "Gender", type: "select" },
    { key: "dob", label: "DOB", type: "select" },
    { key: "joiningDate", label: "Joining Date", type: "select" },
    { key: "companyName", label: "Company", type: "text" },
    { key: "location", label: "Location", type: "text" },
    { key: "package", label: "CTC", type: "text" },
    { key: "status", label: "Status", type: "select" },
    
  ];

  const loading = false;
  const fetchInterviewDetails = () => console.log("Refreshing selected candidates");

  return (
    <DataTable
      data={filteredData}
      columns={columns}
      pageLimit={20}
      title="Selected Candidates List"
      onRefresh={fetchInterviewDetails}
      isRefreshing={loading}
      noDataMessage={
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Records Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No candidates have been selected yet.
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
  );
};

export default PlacementsList;
