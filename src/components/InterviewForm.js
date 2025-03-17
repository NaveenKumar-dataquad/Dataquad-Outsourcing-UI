import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  resetForm,
  submitInterviewForm,
  clearError,
} from "../redux/features/interviewSheduleSlice";
import {
  Button,
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Paper,
} from "@mui/material";
import { Check } from "lucide-react";
import dayjs from "dayjs";


const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

// Validation Schema
const validationSchema = Yup.object().shape({
  jobId: Yup.string().required("Job ID is required"),
  candidateId: Yup.string().required("Candidate ID is required"),
  candidateFullName: Yup.string().required("Candidate name is required"),
  candidateContactNo: Yup.string().required("Contact number is required"),
  candidateEmailId: Yup.string()
    .email("Invalid email format")
    .required("Candidate email is required"),
  userEmail: Yup.string()
    .email("Invalid email format")
    .required("User email is required"),
  clientName: Yup.string().required("Client name is required"),
  clientEmail: Yup.string()
    .nullable()
    .trim()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format (e.g., clientname@something.com)"
    ),
    interviewDateTime: Yup.date()
    .required("Interview date and time is required")
    .min(oneMonthAgo, "Interview date and time must be within the last month or in the future"),
  duration: Yup.number()
    .required("Duration is required")
    .min(15, "Duration must be at least 15 minutes")
    .max(60, "Duration cannot exceed 60 minutes"),
  zoomLink: Yup.string()
    .nullable()
    .trim()
    .matches(/^(https?:\/\/[^\s$.?#].[^\s]*)?$/, "Must be a valid URL"),
  interviewLevel: Yup.string()
    .required("Interview level is required")
    .oneOf(["INTERNAL", "EXTERNAL"]),
  externalInterviewDetails: Yup.string().when(
    "interviewLevel",
    (interviewLevel, schema) => {
      return interviewLevel === "EXTERNAL"
        ? schema.required("External interview details are required")
        : schema;
    }
  ),
});

const InterviewForm = ({
  jobId,
  candidateId,
  candidateFullName,
  candidateContactNo,
  clientName,
  userId,
  candidateEmailId,
  userEmail,
  handleCloseInterviewDialog,
}) => {
  const dispatch = useDispatch();
  const { isSubmitting, submissionSuccess, error, interviewResponse } =
    useSelector((state) => state.interviewForm);

  // Initial form values
  const initialValues = {
    jobId,
    candidateId,
    candidateFullName,
    candidateContactNo,
    clientName,
    userId,
    candidateEmailId,
    userEmail,
    clientEmail: "",
    interviewDateTime: "",
    duration: "",
    zoomLink: "",
    interviewLevel: "INTERNAL",
    externalInterviewDetails: "",
    interviewScheduledTimestamp: null,
  };

  // Auto close dialog on success
  useEffect(() => {
    if (submissionSuccess) {
      setTimeout(() => {
        handleCloseInterviewDialog();
        dispatch(resetForm());
      }, 3000);
    }
  }, [submissionSuccess, dispatch, handleCloseInterviewDialog]);

  const handleSubmit = async (values, { setSubmitting }) => {
    const formattedValues = {
      ...values,
      interviewDateTime: dayjs(values.interviewDateTime).format(),
      interviewScheduledTimestamp: dayjs(values.interviewDateTime).valueOf(),
    };

    dispatch(submitInterviewForm(formattedValues));
    setSubmitting(false);
  };

  const handleDialogClose = () => {
    dispatch(clearError());
    handleCloseInterviewDialog();
  };

  // Custom TextField component for Formik
  const FormikTextField = ({ field, form: { touched, errors }, ...props }) => (
    <TextField
      {...field}
      {...props}
      error={touched[field.name] && Boolean(errors[field.name])}
      helperText={touched[field.name] && errors[field.name]}
      fullWidth
      sx={{
        mb: 0.5,
        "& .MuiOutlinedInput-root": {
          borderRadius: 1.5,
        },
      }}
    />
  );

  // Success Message Component
  const SuccessMessage = () => {
    if (!submissionSuccess || !interviewResponse) return null;

    return (
      <Paper elevation={0} sx={{ mb: 3, backgroundColor: "#f0fdf4", p: 2 }}>
        <Alert
          icon={<Check className="h-5 w-5" />}
          severity="success"
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Interview scheduled for <strong>Candidate ID:</strong>{" "}
            {interviewResponse.candidateId} successfully and email notifications
            sent.
          </Typography>
        </Alert>
      </Paper>
    );
  };

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: "100%",
        maxHeight: "80vh",
      }}
    >
      <SuccessMessage />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values }) => (
          <Form>
            {/* Candidate Details Section (Read-Only Fields) */}
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Candidate Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Field
                    name="jobId"
                    component={FormikTextField}
                    label="Job ID"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Field
                    name="candidateId"
                    component={FormikTextField}
                    label="Candidate ID"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Field
                    name="candidateFullName"
                    component={FormikTextField}
                    label="Candidate Name"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Field
                    name="candidateContactNo"
                    component={FormikTextField}
                    label="Contact Number"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Field
                    name="candidateEmailId"
                    component={FormikTextField}
                    label="Candidate Email"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Field
                    name="userEmail"
                    component={FormikTextField}
                    label="User Email"
                    disabled
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Interview Details Section (Editable Fields) */}
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Interview Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Field
                    name="clientName"
                    component={FormikTextField}
                    label="Client Name"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Field
                    name="clientEmail"
                    component={FormikTextField}
                    label="Client Email"
                    type="email"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Field
                    name="interviewDateTime"
                    component={FormikTextField}
                    label="Interview Date & Time"
                    type="datetime-local"
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Field
                    name="duration"
                    component={FormikTextField}
                    label="Duration (Minutes)"
                    type="number"
                    required
                    inputProps={{ min: 15, max: 60 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Field
                    name="zoomLink"
                    component={FormikTextField}
                    label="Interview Link"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl component="fieldset" required>
                    <FormLabel component="legend">Interview Level</FormLabel>
                    <Field name="interviewLevel">
                      {({ field }) => (
                        <RadioGroup {...field} row>
                          <FormControlLabel
                            value="INTERNAL"
                            control={<Radio />}
                            label="Internal"
                          />
                          <FormControlLabel
                            value="EXTERNAL"
                            control={<Radio />}
                            label="External"
                          />
                        </RadioGroup>
                      )}
                    </Field>
                  </FormControl>
                </Grid>
                {values.interviewLevel === "EXTERNAL" && (
                  <Grid item xs={12}>
                    <Field
                      name="externalInterviewDetails"
                      component={FormikTextField}
                      label="External Interview Details"
                      multiline
                      rows={3}
                      required
                    />
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Form Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={handleDialogClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? "Scheduling..." : "Schedule Interview"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default InterviewForm;
