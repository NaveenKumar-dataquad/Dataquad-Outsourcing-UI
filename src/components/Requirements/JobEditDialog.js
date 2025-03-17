import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  IconButton,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  CircularProgress,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import RecruiterMultiSelect from "../MuiComponents/RecruiterMultiSelect";

const JobEditDialog = ({
  editDialogOpen,
  handleCloseEditDialog,
  editFormData,
  handleInputChange,
  recruiters,
  handleSelectRecruiter,
  handleSubmitEdit,
  setEditFormData,
}) => {
  // Track the description type ("text" or "file")
  const [descriptionType, setDescriptionType] = useState("text");
  const [loading, setLoading] = useState(false);

  // Set initial description type based on editFormData when dialog opens
  useEffect(() => {
    if (editDialogOpen) {
      setDescriptionType(editFormData.jobDescriptionBlob ? "file" : "text");
    }
  }, [editDialogOpen, editFormData]);

  // Handle radio button change
  const handleDescriptionTypeChange = (event) => {
    setDescriptionType(event.target.value);
  };

  const handleSubmitWithLoader = async (e) => {
    setLoading(true); // ✅ Start loading
    await handleSubmitEdit(e); // Call actual form submission
    setLoading(false); // ✅ Stop loading after API response
  };

  // Handle file upload for jobDescriptionBlob
  const handleFileUpload = (event) => {
    const file = event.target.files[0]; // Get the selected file

    if (file) {
      // Store the actual file instead of just the file name
      setEditFormData((prev) => ({
        ...prev,
        jobDescriptionBlob: file, // Store the full file object
        jobDescriptionFile: file.name, // Optional: Store file name separately
      }));
    }
  };

  return (
    <Dialog
      open={editDialogOpen}
      onClose={handleCloseEditDialog}
      maxWidth="md"
      fullWidth
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#004d40",
          color: "white",
          padding: "16px",
          position: "relative",
          zIndex: 1000,
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Edit Job Requirement
        <IconButton
          aria-label="close"
          onClick={handleCloseEditDialog}
          sx={{
            color: "white",
            position: "absolute",
            right: 16,
            top: 12,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={50} />
        </Box>
      )}

      <DialogContent
        sx={{
          mt: "24px",
          padding: "16px",
          overflowY: "auto",
          maxHeight: "70vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            border: "1px solid #ddd",
          }}
        >
          <Grid container spacing={3}>
            {/* Job ID */}
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                name="jobId"
                label="Job ID"
                value={editFormData.jobId || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                disabled
                sx={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              />
            </Grid>

            {/* Job Title */}
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                name="jobTitle"
                label="Job Title"
                value={editFormData.jobTitle || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              />
            </Grid>

            {/* Client Name */}
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                name="clientName"
                label="Client Name"
                value={editFormData.clientName || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              />
            </Grid>

            {/* Description Type Selector */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Job Description Type</FormLabel>
                <RadioGroup
                  row
                  value={descriptionType}
                  onChange={handleDescriptionTypeChange}
                >
                  <FormControlLabel
                    value="text"
                    control={<Radio />}
                    label="Text Description"
                  />
                  <FormControlLabel
                    value="file"
                    control={<Radio />}
                    label="Upload File"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Conditionally render Job Description input */}
            {descriptionType === "text" && (
              <Grid item xs={12}>
                <TextField
                  name="jobDescription"
                  label="Job Description"
                  value={editFormData.jobDescription || ""}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "5px",
                  }}
                />
              </Grid>
            )}

            {/* Conditionally render File Upload for Job Description */}
            {descriptionType === "file" && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: "1px dashed #ccc",
                    borderRadius: "5px",
                    padding: "16px",
                    textAlign: "center",
                    backgroundColor: "#f9f9f9",
                    marginBottom: "16px",
                  }}
                >
                  <input
                    type="file"
                    id="job-description-file-upload"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="job-description-file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AttachFileIcon />}
                    >
                      Upload Job Description File
                    </Button>
                  </label>

                  {/* Show selected file */}
                  {editFormData.jobDescriptionBlob ? (
                    <Typography variant="body2">
                      Current File: {editFormData.jobDescriptionBlob.name}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No file selected
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}

            {/* Job Type */}
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                name="jobType"
                label="Job Type"
                value={editFormData.jobType || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                name="location"
                label="Location"
                value={editFormData.location || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              />
            </Grid>

            {/* Job Mode */}
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                name="jobMode"
                label="Job Mode"
                value={editFormData.jobMode || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                name="assignedBy"
                label="Assigned By"
                value={editFormData.assignedBy || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
                disabled
              />
            </Grid>

            {/* Experience Required */}
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                name="experienceRequired"
                label="Experience Required"
                value={editFormData.experienceRequired || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <FormControl
                fullWidth
                variant="outlined"
                sx={{ backgroundColor: "white", borderRadius: "5px" }}
              >
                <InputLabel>Requirement Status</InputLabel>
                <Select
                  name="status"
                  value={editFormData.status || ""}
                  onChange={handleInputChange}
                  label="Requirement Status"
                >
                  {/* Default value - show previous selected value */}
                  {editFormData.status && (
                    <MenuItem value={editFormData.status}>
                      {editFormData.status}
                    </MenuItem>
                  )}

                  {/* Other options */}
                  <MenuItem value="Closed">Closed</MenuItem>
                  <MenuItem value="Hold">Hold</MenuItem>
                  <MenuItem value="InProgress">InProgress</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Notice Period */}
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                name="noticePeriod"
                label="Notice Period"
                value={editFormData.noticePeriod || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              />
            </Grid>

            {/* Relevant Experience */}
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                name="relevantExperience"
                label="Relevant Experience"
                value={editFormData.relevantExperience || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              />
            </Grid>

            {/* Qualification */}
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                name="qualification"
                label="Qualification"
                value={editFormData.qualification || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              />
            </Grid>

            {/* Salary Package */}
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                name="salaryPackage"
                label="Salary Package"
                value={editFormData.salaryPackage || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              />
            </Grid>

            {/* No Of Positions */}
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                name="noOfPositions"
                label="No Of Positions"
                value={editFormData.noOfPositions || ""}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              />
            </Grid>

            {/* Recruiter Selection Section */}
            <Grid
              item
              xs={12}
              sm={12}
              md={6}
              lg={6}
              sx={{ overflowY: "auto", maxHeight: 400 }}
            >
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Select Recruiters
              </Typography>
              <Select
                multiple
                value={editFormData.recruiterName || []}
                onChange={handleSelectRecruiter}
                renderValue={(selected) => selected.join(", ")}
                fullWidth
                sx={{ minHeight: 56 }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      overflowY: "auto",
                    },
                  },
                }}
              >
                {recruiters.map((emp) => (
                  <MenuItem key={emp.employeeId} value={emp.userName}>
                    <Checkbox
                      checked={
                        Array.isArray(editFormData.recruiterName) &&
                        editFormData.recruiterName.includes(emp.userName)
                      }
                    />
                    <ListItemText primary={emp.userName} />
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              sx={{ overflowY: "auto", maxHeight: 400 }}
            >
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Select Recruiters
              </Typography>
              <RecruiterMultiSelect
                values={values}
                setFieldValue={setFieldValue}
                errors={errors}
                touched={touched}
              />
            </Grid> */}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: "grey.100" }}>
        <Button
          onClick={handleCloseEditDialog}
          variant="outlined"
          color="primary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmitWithLoader}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Update"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobEditDialog;
