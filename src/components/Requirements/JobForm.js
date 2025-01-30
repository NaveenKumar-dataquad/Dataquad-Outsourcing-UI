// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   postJobRequirement,
//   updateField,
//   resetForm,
// } from "../../redux/features/jobFormSlice";
// import {
//   Box,
//   Button,
//   TextField,
//   Typography,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Grid,
//   useTheme,
//   CircularProgress,
// } from "@mui/material";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import useEmployees from "../customHooks/useEmployees";

// const JobForm = () => {
//   const theme = useTheme();
//   const dispatch = useDispatch();
//   const { formData, status, error, jobPostingSuccessResponse } = useSelector(
//     (state) => state.jobForm
//   );

//   // Using the custom hook for employee data
//   const {
//     employees: filterEmployees,
//     status: fetchStatus,
//     error: fetchError
//   } = useEmployees('EMPLOYEE');

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     dispatch(updateField({ name, value }));
//   };

//   React.useEffect(() => {
//     if (status === "succeeded" && jobPostingSuccessResponse) {
//       toast.success(`Job Created Successfully! Job Title: ${jobPostingSuccessResponse.jobTitle} Job ID: ${jobPostingSuccessResponse.jobId}`)
//     }

//     if (status === "failed" && error) {
//       toast.error(error || "An error occurred");
//     }
//   }, [status, jobPostingSuccessResponse, error]);

//   const handleSubmit = async () => {
//     try {
//       const response = await dispatch(postJobRequirement(formData));
//       if (!response.payload?.successMessage) {
//         toast.error("Failed to create job posting");
//       }
//     } catch (error) {
//       toast.error("Unexpected error occurred");
//     }
//   };

//   const handleClear = () => {
//     dispatch(resetForm());
//     toast.info("Form cleared successfully");
//   };

//   const commonBorderStyles = {
//     "& .MuiOutlinedInput-root": {
//       backgroundColor: "transparent",
//     },
//     "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
//       borderColor: "black",
//       borderWidth: "0.3px",
//       backgroundColor: "transparent",
//     },
//     "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
//       borderColor: "black",
//     },
//     "&.Mui-focused .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
//       borderColor: "black",
//     },
//   };

//   const isFormValid = () => {
//     return Object.values(formData).every((value) => value !== "");
//   };

//   return (
//     <Box
//       sx={{
//         padding: { xs: 2, sm: 3, md: 4 },
//         borderRadius: 2,
//         backgroundColor: "#FBFBFB",
//         margin: { xs: 2, sm: 3, md: "auto" },
//         boxShadow: 2,
//       }}
//     >
//       <Typography
//         variant="h5"
//         align="start"
//         marginBottom="5vh"
//         color="primary"
//         gutterBottom
//         sx={{
//           backgroundColor: "rgba(232, 245, 233)",
//           padding: 1,
//           borderRadius: 1,
//         }}
//       >
//         Post Requirement
//       </Typography>

//       <Grid container spacing={3}>
//         {/* Text fields */}
//         {[
//           { name: "jobTitle", label: "Job Title", type: "text" },
//           { name: "clientName", label: "Client Name", type: "text" },
//           { name: "location", label: "Location", type: "text" },
//           {
//             name: "experienceRequired",
//             label: "Experience Required",
//             type: "number",
//           },
//           {
//             name: "relevantExperience",
//             label: "Relevant Experience",
//             type: "number",
//           },
//           { name: "qualification", label: "Qualification", type: "text" },
//         ].map((field) => (
//           <Grid item xs={12} sm={6} md={3} key={field.name}>
//             <TextField
//               fullWidth
//               variant="filled"
//               type={field.type}
//               label={field.label}
//               name={field.name}
//               value={formData[field.name]}
//               onChange={handleChange}
//               sx={commonBorderStyles}
//             />
//           </Grid>
//         ))}

//         {/* Dropdown fields */}
//         {[
//           {
//             name: "jobType",
//             label: "Job Type",
//             options: ["Full-time", "Part-time", "Contract"],
//           },
//           {
//             name: "jobMode",
//             label: "Job Mode",
//             options: ["Remote", "On-site", "Hybrid"],
//           },
//           {
//             name: "noticePeriod",
//             label: "Notice Period",
//             options: [
//               "Immediate",
//               "15 days",
//               "30 days",
//               "45 days",
//               "60 days",
//               "75 days",
//               "90 days",
//             ],
//           },
//         ].map((field) => (
//           <Grid item xs={12} sm={6} md={3} key={field.name}>
//             <FormControl fullWidth variant="outlined">
//               <InputLabel sx={{ color: "black" }}>{field.label}</InputLabel>
//               <Select
//                 name={field.name}
//                 value={formData[field.name]}
//                 onChange={handleChange}
//                 label={field.label}
//                 variant="filled"
//                 sx={{
//                   ...commonBorderStyles,
//                   "&:hover": { borderColor: theme.palette.primary.main },
//                 }}
//               >
//                 {field.options.map((option) => (
//                   <MenuItem key={option} value={option}>
//                     {option}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Grid>
//         ))}

//         {/* Recruiter Select */}
//         <Grid item xs={12} sm={6} md={3}>
//           <FormControl fullWidth variant="outlined">
//             <InputLabel sx={{ color: "black" }}>Select Recruiter</InputLabel>
//             <Select
//               name="recruiterIds"
//               value={Array.isArray(formData.recruiterIds) ? formData.recruiterIds : []}
//               onChange={handleChange}
//               label="Recruiter IDs"
//               variant="filled"
//               sx={{
//                 ...commonBorderStyles,
//                 "&:hover": { borderColor: theme.palette.primary.main },
//                 "& .MuiSelect-icon": { color: theme.palette.primary.main },
//               }}
//               MenuProps={{
//                 PaperProps: {
//                   sx: {
//                     maxHeight: 200,
//                     overflowY: "auto",
//                     backgroundColor: "#f7f7f7",
//                     borderRadius: 1,
//                     boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
//                     "& .MuiMenuItem-root": {
//                       padding: "10px 16px",
//                       fontSize: "0.9rem",
//                       borderRadius: "10px",
//                       "&:hover": {
//                         backgroundColor: theme.palette.action.hover,
//                       },
//                       "&.Mui-selected": {
//                         backgroundColor: theme.palette.primary.light,
//                         color: theme.palette.primary.contrastText,
//                         "&:hover": {
//                           backgroundColor: theme.palette.primary.main,
//                         },
//                       },
//                     },
//                   },
//                 },
//               }}
//             >
//               {fetchStatus === "loading" ? (
//                 <MenuItem disabled>Loading employees...</MenuItem>
//               ) : filterEmployees.length > 0 ? (
//                 filterEmployees.map((employee) => (
//                   <MenuItem
//                     key={employee.employeeId}
//                     value={employee.employeeId}
//                   >
//                     {employee.employeeName}
//                   </MenuItem>
//                 ))
//               ) : (
//                 <MenuItem disabled>No employees available</MenuItem>
//               )}
//             </Select>
//           </FormControl>
//         </Grid>

//         {/* Job Description Field */}
//         <Grid item xs={12} md={6}>
//           <TextField
//             fullWidth
//             variant="filled"
//             label="Job Description"
//             name="jobDescription"
//             value={formData.jobDescription}
//             onChange={handleChange}
//             sx={commonBorderStyles}
//             multiline
//             rows={3}
//           />
//         </Grid>
//       </Grid>

//       {/* Action buttons */}
//       <Box
//         sx={{
//           marginTop: "3vh",
//           display: "flex",
//           justifyContent: "flex-end",
//           gap: 3,
//         }}
//       >
//         <Button
//           variant="outlined"
//           color="primary"
//           onClick={handleClear}
//           disabled={status === "loading"}
//           sx={{ width: "15%" }}
//         >
//           Clear
//         </Button>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleSubmit}
//           disabled={status === "loading" || !isFormValid()}
//           sx={{ width: "20%" }}
//         >
//           {status === "loading" ? <CircularProgress size={24} /> : "Post Requirement"}
//         </Button>
//       </Box>
//       <ToastContainer />
//     </Box>
//   );
// };

// export default JobForm;

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  postJobRequirement,
  updateField,
  resetForm,
} from "../../redux/features/jobFormSlice";
import { fetchEmployees } from "../../redux/features/employeesSlice";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const JobForm = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Get job form state
  const { formData, status, error, jobPostingSuccessResponse } = useSelector(
    (state) => state.jobForm
  );
  
  // Get employees state and create a selector for filtering
  const { employeesList, fetchStatus, fetchError } = useSelector((state) => state.employees);
  const recruiters = employeesList.filter(emp => emp.roles === "EMPLOYEE" && emp.status === "ACTIVE");

  // Fetch employees on component mount
  React.useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    dispatch(updateField({ name, value }));
  };

  const handleRecruitersChange = (event) => {
    const selectedNames = event.target.value;
    const selectedIds = selectedNames
      .map((name) => {
        const employee = recruiters.find(
          (emp) => emp.userName === name
        );
        return employee ? employee.employeeId : null;
      })
      .filter((id) => id !== null);

    dispatch(updateField({ name: "recruiterName", value: selectedNames }));
    dispatch(updateField({ name: "recruiterIds", value: selectedIds }));
  };

  React.useEffect(() => {
    if (status === "succeeded" && jobPostingSuccessResponse) {
      toast.success(
        `Job Created Successfully! Job Title: ${jobPostingSuccessResponse.jobTitle} Job ID: ${jobPostingSuccessResponse.jobId}`
      );
    }

    if (status === "failed" && error) {
      toast.error(error || "An error occurred");
    }
  }, [status, jobPostingSuccessResponse, error]);

  const handleSubmit = async () => {
    try {
      const finalData = {
        ...formData,
        experienceRequired: `${formData.experienceRequired} years`,
        relevantExperience: `${formData.relevantExperience} years`,
      };

      const response = await dispatch(postJobRequirement(finalData));

      if (!response.payload?.successMessage) {
        toast.error("Failed to create job posting");
      }
    } catch (error) {
      toast.error("Unexpected error occurred");
    }
  };

  const handleClear = () => {
    dispatch(resetForm());
    toast.info("Form cleared successfully");
  };

  const commonBorderStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "transparent",
    },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "black",
      borderWidth: "0.3px",
      backgroundColor: "transparent",
    },
    "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "black",
    },
    "&.Mui-focused .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "black",
    },
  };

  return (
    <Box
      sx={{
        padding: { xs: 2, sm: 3, md: 4 },
        borderRadius: 2,
        backgroundColor: "#FBFBFB",
        margin: { xs: 2, sm: 3, md: "auto" },
        boxShadow: 2,
      }}
    >
      <Typography
        variant="h5"
        align="start"
        marginBottom="5vh"
        color="primary"
        gutterBottom
        sx={{
          backgroundColor: "rgba(232, 245, 233)",
          padding: 1,
          borderRadius: 1,
        }}
      >
        Post Requirement
      </Typography>

      <Grid container spacing={3}>
        {[
          { name: "jobTitle", label: "Job Title", type: "text" },
          { name: "clientName", label: "Client Name", type: "text" },
          { name: "location", label: "Location", type: "text" },
          {
            name: "experienceRequired",
            label: "Experience Required (years)",
            type: "number",
          },
          {
            name: "relevantExperience",
            label: "Relevant Experience (years)",
            type: "number",
          },
          { name: "qualification", label: "Qualification", type: "text" },
          { name: "jobDescription", label: "Job Description", type: "text" },
        ].map((field) => (
          <Grid item xs={12} sm={6} md={3} key={field.name}>
            <TextField
              fullWidth
              variant="outlined"
              type={field.type}
              label={field.label}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              sx={commonBorderStyles}
              multiline={field.name === "jobDescription"}
              rows={field.name === "jobDescription" ? 2 : 1}
            />
          </Grid>
        ))}

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel sx={{ color: "black" }}>Select Recruiters</InputLabel>
            <Select
              name="recruiterName"
              value={formData.recruiterName || []}
              onChange={handleRecruitersChange}
              label="Select Recruiters"
              variant="outlined"
              multiple
              sx={{
                height: "56px",
                overflow: "hidden",
                "& .MuiSelect-select": {
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 200,
                    overflowY: "auto",
                  },
                },
              }}
            >
              {fetchStatus === "loading" ? (
                <MenuItem disabled>Loading recruiters...</MenuItem>
              ) : recruiters.length > 0 ? (
                recruiters.map((employee) => (
                  <MenuItem
                    key={employee.employeeId}
                    value={employee.userName}
                  >
                    {employee.userName} - {employee.employeeId}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No recruiters available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        {[
          {
            name: "jobType",
            label: "Job Type",
            options: ["Full-Time", "Part-Time", "Contract"],
          },
          {
            name: "jobMode",
            label: "Job Mode",
            options: ["Remote", "On-site", "Hybrid"],
          },
          {
            name: "noticePeriod",
            label: "Notice Period",
            options: [
              "Immediate",
              "15 days",
              "30 days",
              "45 days",
              "60 days",
              "75 days",
              "90 days",
            ],
          },
        ].map((field) => (
          <Grid item xs={12} sm={6} md={3} key={field.name}>
            <FormControl fullWidth variant="outlined">
              <InputLabel sx={{ color: "black" }}>{field.label}</InputLabel>
              <Select
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                label={field.label}
                variant="outlined"
                sx={commonBorderStyles}
              >
                {field.options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          marginTop: "3vh",
          display: "flex",
          justifyContent: "flex-end",
          gap: 3,
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          onClick={handleClear}
          disabled={status === "loading"}
          sx={{ width: "15%" }}
        >
          Clear
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={status === "loading"}
          sx={{ width: "20%" }}
        >
          {status === "loading" ? (
            <CircularProgress size={24} />
          ) : (
            "Post Requirement"
          )}
        </Button>
      </Box>
      <ToastContainer />
    </Box>
  );
};

export default JobForm;