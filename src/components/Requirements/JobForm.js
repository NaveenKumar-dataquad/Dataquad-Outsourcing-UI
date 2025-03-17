import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Grid,
  Paper,
  CircularProgress,
  Stack,
  Divider,
  Card,
  CardContent,
  FormHelperText,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RefreshIcon from "@mui/icons-material/Refresh";
import SendIcon from "@mui/icons-material/Send";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import RecruiterMultiSelect from "../MuiComponents/RecruiterMultiSelect";
import BASE_URL from "../../redux/config";
import QualificationField from "../../utils/QualificationDropdown";
import {
  PersonOutline,
  WorkOutline,
  InfoOutlined,
  LocationOn,
} from "@mui/icons-material";
import { useSelector ,useDispatch} from "react-redux";
import { fetchEmployees } from "../../redux/features/employeesSlice";



// Validation Schema
const JobFormSchema = Yup.object().shape({
  jobTitle: Yup.string()
    .required("Job title is required")
    .min(3, "Job title must be at least 3 characters"),
  clientName: Yup.string()
    .required("Client name is required")
    .min(2, "Client name must be at least 2 characters"),
  location: Yup.string().required("Location is required"),
  experienceRequired: Yup.number()
    .required("Experience is required")
    .min(0, "Experience cannot be negative")
    .max(50, "Experience cannot exceed 50 years"),
  relevantExperience: Yup.number()
    .required("Relevant experience is required")
    .min(0, "Experience cannot be negative")
    .max(50, "Experience cannot exceed 50 years"),
  qualification: Yup.string().required("Qualification is required"),
  noOfPositions: Yup.number()
    .required("Number of positions is required")
    .min(1, "At least one position is required")
    .integer("Number of positions must be a whole number"),
  salaryPackage: Yup.number()
    .required("Salary package is required")
    .min(1, "Salary must be greater than 0"),
  jobType: Yup.string().required("Job type is required"),
  jobMode: Yup.string().required("Job mode is required"),
  noticePeriod: Yup.string().required("Notice period is required"),
  recruiterName: Yup.array()
    .min(1, "At least one recruiter must be selected")
    .required("At least one recruiter must be selected"),
  jobDescription: Yup.string().when("jobDescriptionFile", {
    is: (file) => !file, // Validate only if no file is uploaded
    then: (schema) => schema.required("Job description is required").min(20),
    otherwise: (schema) => schema.notRequired(),
  }),
  jobDescriptionFile: Yup.mixed()
    .nullable()
    .test(
      "job-description-check",
      "Provide either text or a file for Job Description",
      function (value) {
        const jobDescription = this.resolve(Yup.ref("jobDescription"));
        if (!jobDescription && !value) {
          return this.createError({
            message: "Either text or file is required for Job Description",
          });
        }
        return true;
      }
    )
    .test(
      "fileSize",
      "File too large (Max: 5MB)",
      (value) => !value || (value && value.size <= 5 * 1024 * 1024)
    )
    .test(
      "fileType",
      "Unsupported format (Allowed: PDF, DOCX, Images)",
      (value) =>
        !value ||
        (value &&
          [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png",
            "image/jpeg",
          ].includes(value.type))
    ),
});

// Custom Field Components
// Simple reusable Formik TextField with optional icon
const CustomTextField = ({
  field,
  form: { touched, errors },
  icon,
  ...props
}) => (
  <TextField
    {...field}
    {...props}
    error={touched[field.name] && Boolean(errors[field.name])}
    helperText={touched[field.name] && errors[field.name]}
    InputProps={{
      startAdornment: icon && (
        <InputAdornment position="start">{icon}</InputAdornment>
      ),
    }}
  />
);

// Select for jobType, jobMode, noticePeriod, etc.
const CustomSelectField = ({
  field,
  form: { touched, errors },
  label,
  children,
  icon,
  ...props
}) => (
  <FormControl
    fullWidth
    error={touched[field.name] && Boolean(errors[field.name])}
    variant="outlined"
  >
    <InputLabel>{label}</InputLabel>
    <Select
      {...field}
      label={label}
      startAdornment={
        icon && <InputAdornment position="start">{icon}</InputAdornment>
      }
      {...props}
    >
      {children}
    </Select>
    {touched[field.name] && errors[field.name] && (
      <FormHelperText>{errors[field.name]}</FormHelperText>
    )}
  </FormControl>
);



const JobForm = () => {
  // Local state instead of Redux
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [fetchingEmployees, setFetchingEmployees] = useState(false);
  const [successResponse, setSuccessResponse] = useState(null);
  const [jobDescriptionType, setJobDescriptionType] = useState("text");
  const [assignedByName, setAssignedByName] = useState("Loading...");
const { employeesList, fetchStatus, fetchError, updateStatus, updateError } =
    useSelector((state) => state.employees);
  // Get current user ID from Redux store
  const { roles, user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
 
  
  // Fetch employees when component mounts
  useEffect(() => {
    dispatch(fetchEmployees());
  }, []);
  
  // Update assignedBy when employees data is loaded and user ID is available
  useEffect(() => {
    if (employeesList.length > 0 && user) {
      const assignedUser = employeesList.find((emp) => emp.employeeId === user);
      if (assignedUser) {
        setAssignedByName(assignedUser.userName);
      } else {
        setAssignedByName("Unknown");
        console.warn("Could not find user with ID:", user);
      }
    }
  }, [employeesList, user]);

  // Filter recruiters
  const recruiters = employeesList.filter(
    (emp) =>
      (emp.roles === "EMPLOYEE" || emp.roles === "TEAMLEAD") &&
      emp.status === "ACTIVE"
  );

  // const fetchEmployees = async () => {
  //   setFetchingEmployees(true);
  //   try {
  //     const response = await axios.get(`/users/employee`);
  //     setEmployees(response.data);
  //   } catch (error) {
  //     console.error("Error fetching employees:", error);
  //     toast.error("Failed to fetch employees");
  //   } finally {
  //     setFetchingEmployees(false);
  //   }
  // };

  // Post job requirement function
  const postJobRequirement = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/requirements/assignJob`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccessResponse(response.data);

      // Check if the response indicates success
      if (response.data.success) {
        toast.success(
          `Job Created Successfully! Job Title: ${response.data.data.jobTitle}, Job ID: ${response.data.data.jobId}. ${response.data.data.successMessage}`
        );
        return true;
      } else {
        // Combine the message and error details if available
        const errMsg = `${response.data.message}${
          response.data.error ? ` - ${response.data.error}` : ""
        }`;
        toast.error(errMsg);
        return false;
      }
    } catch (error) {
      console.error("Error posting job requirement:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to post job requirement";
      const errorDetail = error.response?.data?.error
        ? ` - ${error.response.data.error}`
        : "";
      toast.error(errorMessage + errorDetail);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const initialValues = {
    jobTitle: "",
    clientName: "",
    jobDescription: "",
    jobType: "",
    location: "",
    jobMode: "",
    experienceRequired: "",
    noticePeriod: "",
    relevantExperience: "",
    qualification: "",
    recruiterIds: [],
    recruiterName: [],
    salaryPackage: "",
    noOfPositions: "",
    status: "In Progress",
    jobDescriptionFile: null,
    assignedBy: assignedByName,
  };

  const textFieldStyle = {
    borderRadius: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "#ffffff",
      transition: "all 0.3s ease-in-out",
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
      "&.Mui-focused": {
        backgroundColor: "#ffffff",
        boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
      },
    },
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const formData = new FormData();
      formData.append("jobTitle", values.jobTitle);
      formData.append("clientName", values.clientName);
      formData.append("location", values.location);
      formData.append(
        "experienceRequired",
        `${values.experienceRequired} years`
      );
      formData.append(
        "relevantExperience",
        `${values.relevantExperience} years`
      );
      formData.append("qualification", values.qualification);
      formData.append("salaryPackage", `${Number(values.salaryPackage)} LPA`);
      formData.append("noOfPositions", Number(values.noOfPositions));
      formData.append("jobType", values.jobType);
      formData.append("jobMode", values.jobMode);
      formData.append("noticePeriod", values.noticePeriod);
      formData.append("status", values.status);

      formData.append("recruiterIds", JSON.stringify(values.recruiterIds));
      formData.append("recruiterName", JSON.stringify(values.recruiterName));

      if (jobDescriptionType === "text" && values.jobDescription) {
        formData.append("jobDescription", values.jobDescription);
      } else if (jobDescriptionType === "file" && values.jobDescriptionFile) {
        formData.append("jobDescriptionFile", values.jobDescriptionFile);
      }

      // Use the updated assignedBy value from state
      formData.append("assignedBy", assignedByName);

      const success = await postJobRequirement(formData);

      if (success) {
        resetForm();
      }
    } catch (error) {
      toast.error("Unexpected error occurred");
    }
  };

  const handleClear = (resetForm) => {
    resetForm();
    setSuccessResponse(null);
    toast.info("Form cleared successfully");
  };

  return (
    <Paper
      sx={{
        width: "90%",
        margin: "auto",
        mt: 3,
        mb: 3,
      }}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={JobFormSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true} // Important: re-initialize form when assignedByName changes
      >
        {({ values, resetForm, setFieldValue, errors, touched }) => (
          <Form>
            <Box sx={{ p: 3 }}>
              {/* Header Section */}
              <Typography
                variant="h5"
                component="h1"
                color="#FFFFFF"
                fontWeight="500"
                sx={{
                  mb: 1,
                  backgroundColor: "#00796b",
                  p: 2,
                  borderRadius: 1,
                }}
              >
                Post Job Requirement
              </Typography>

              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    gutterBottom
                    fontWeight="500"
                  >
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Field
                        name="jobTitle"
                        component={CustomTextField}
                        label="Job Title"
                        icon={<WorkOutline fontSize="small" />}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Field
                        name="clientName"
                        component={CustomTextField}
                        label="Client Name"
                        icon={<PersonOutline fontSize="small" />}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Field
                        name="location"
                        component={CustomTextField}
                        label="Location"
                        icon={<LocationOn fontSize="small" />}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Experience & Qualification */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    gutterBottom
                    fontWeight="500"
                  >
                    Experience & Qualification
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Field
                        name="experienceRequired"
                        component={CustomTextField}
                        type="number"
                        label="Experience Required (years)"
                        icon={<WorkOutline fontSize="small" />}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Field
                        name="relevantExperience"
                        component={CustomTextField}
                        type="number"
                        label="Relevant Experience (years)"
                        icon={<WorkOutline fontSize="small" />}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <QualificationField />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Field
                        name="noOfPositions"
                        component={CustomTextField}
                        type="number"
                        label="Number of Positions"
                        icon={<InfoOutlined fontSize="small" />}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Field
                        name="salaryPackage"
                        component={CustomTextField}
                        type="number"
                        label="Salary Package (LPA)"
                        icon={<InfoOutlined fontSize="small" />}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Field
                        name="assignedBy"
                        component={CustomTextField}
                        label="Assigned By"
                        fullWidth
                        disabled // Prevent editing
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Job Details */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    gutterBottom
                    fontWeight="500"
                  >
                    Job Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Field
                        name="jobType"
                        component={CustomSelectField}
                        label="Job Type"
                        icon={<InfoOutlined fontSize="small" />}
                      >
                        {["Full-time", "Part-time", "Contract"].map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Field
                        name="jobMode"
                        component={CustomSelectField}
                        label="Job Mode"
                        icon={<InfoOutlined fontSize="small" />}
                      >
                        {["Remote", "On-site", "Hybrid"].map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Field
                        name="noticePeriod"
                        component={CustomSelectField}
                        label="Notice Period"
                        icon={<InfoOutlined fontSize="small" />}
                      >
                        {[
                          "Immediate",
                          "15 days",
                          "30 days",
                          "45 days",
                          "60 days",
                        ].map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Recruiters & Description */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    color="primary"
                    gutterBottom
                    fontWeight="600"
                  >
                    Recruiters & Description
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    {/* Recruiter Selection */}
                    <Grid item xs={12} md={6}>
                      <RecruiterMultiSelect
                        recruiters={recruiters}
                        values={values}
                        setFieldValue={setFieldValue}
                        errors={errors}
                        touched={touched}
                        isLoading={fetchingEmployees}
                      />
                    </Grid>

                    {/* Job Description Type Selection */}
                    <Grid item xs={4} md={6}>
                      <Typography variant="subtitle1" fontWeight="500">
                        Job Description Input Type
                      </Typography>
                      <RadioGroup
                        row
                        value={jobDescriptionType}
                        onChange={(event) =>
                          setJobDescriptionType(event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="text"
                          control={<Radio />}
                          label="Text"
                        />
                        <FormControlLabel
                          value="file"
                          control={<Radio />}
                          label="File Upload"
                        />
                      </RadioGroup>
                    </Grid>

                    {/* Job Description Input */}
                    <Grid item xs={8} md={6}>
                      {jobDescriptionType === "text" ? (
                        <Field
                          name="jobDescription"
                          component={CustomTextField}
                          fullWidth
                          multiline
                          rows={4}
                          label="Job Description"
                          variant="outlined"
                          sx={textFieldStyle}
                        />
                      ) : (
                        <>
                          <Typography
                            variant="subtitle1"
                            sx={{ mb: 1 }}
                            fontWeight="500"
                          >
                            Upload Job Description (PDF, DOCX, Image)
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 1,
                              border: "2px dashed #ccc",
                              padding: 3,
                              borderRadius: 2,
                              textAlign: "center",
                              cursor: "pointer",
                              "&:hover": { borderColor: "primary.main" },
                              transition: "border 0.3s ease",
                            }}
                          >
                            {/* Hidden File Input */}
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                              style={{ display: "none" }}
                              id="job-description-file"
                              onChange={(event) => {
                                const file = event.target.files[0];
                                setFieldValue("jobDescriptionFile", file);
                              }}
                            />

                            {/* File Upload Button */}
                            <label htmlFor="job-description-file">
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Button
                                  component="span"
                                  variant="contained"
                                  color="primary"
                                  startIcon={<CloudUploadIcon />}
                                >
                                  Upload File
                                </Button>
                                <Typography variant="body2">
                                  {values.jobDescriptionFile
                                    ? values.jobDescriptionFile.name
                                    : "No file selected"}
                                </Typography>
                              </Stack>
                            </label>
                          </Box>
                          {errors.jobDescriptionFile &&
                            touched.jobDescriptionFile && (
                              <FormHelperText error>
                                {errors.jobDescriptionFile}
                              </FormHelperText>
                            )}
                        </>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Submit and Reset Buttons */}
              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-end"
                sx={{ mt: 3 }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleClear(resetForm)}
                  startIcon={<RefreshIcon />}
                >
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress
                        size={24}
                        sx={{ color: "white", mr: 1 }}
                      />
                      Posting...
                    </>
                  ) : (
                    "Post Requirement"
                  )}
                </Button>
              </Stack>
            </Box>
          </Form>
        )}
      </Formik>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </Paper>
  );
};

export default JobForm;