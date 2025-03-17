import React, { useState } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



// Material-UI imports
import {
  TextField,
  Button,
  Typography,
  Box,
  Container,
  Grid,
  Paper,
  IconButton,
  Chip,
  InputAdornment,
  Stack,
  Divider,
  Alert,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  useTheme,
  ThemeProvider,
  createTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

import {
  AddCircleOutline,
  RemoveCircleOutline,
  Business,
  LocationOn,
  WorkOutline,
  AttachMoney,
  Language,
  LinkedIn,
  Person,
  Email,
  AttachFile,
  People,
  Percent,
  Save,
  RestartAlt,
  Phone,
  CalendarToday,
} from "@mui/icons-material";
import BASE_URL from "../../redux/config";

// const BASE_URL = 'http://192.168.0.194:8111'

// Create a custom theme with improved colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#1a237e", // Deep blue
    },
    secondary: {
      main: "#0d47a1",
    },
    background: {
      default: "#f8f9fa",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 8px 16px 0 rgba(0,0,0,0.1)",
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #e0e0e0",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
  },
});



const ClientForm = () => {
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currency, setCurrency] = useState("INR");

  // Configure toast styles
  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    clientName: Yup.string().required("Client name is required"),
    clientAddress: Yup.string().nullable(), // Not required
    positionType: Yup.string().nullable(), // Not required
    paymentType: Yup.string().nullable(), // Not required
    netPayment: Yup.number()
      .positive("Must be a positive number")
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      ), // Not required
    gst: Yup.number()
      .min(0, "GST cannot be negative")
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      ), // Not required
    supportingCustomers: Yup.array().of(Yup.string().nullable()), // Not required
    clientWebsiteUrl: Yup.string()
      .url("Must be a valid URL")
      .nullable()
      .transform((value) => (value === "" ? null : value)),
    clientLinkedInUrl: Yup.string()
      .url("Must be a valid URL")
      .nullable()
      .transform((value) => (value === "" ? null : value)),
    clientSpocName: Yup.array().of(Yup.string().nullable()), // Not required
    clientSpocEmailid: Yup.array().of(
      Yup.string().email("Invalid email format").nullable() // Not required
    ),
    clientSpocMobileNumber: Yup.array().of(
      Yup.string()
        .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
        .nullable()
    ),
    clientSpocLinkedin: Yup.array().of(
      Yup.string()
        .url("Must be a valid LinkedIn URL")
        .nullable()
        .transform((value) => (value === "" ? null : value))
    ),
  });

  const initialValues = {
    clientName: "",
    clientAddress: "",
    positionType: "",
    netPayment: "",
    gst: "",
    supportingCustomers: [],
    clientWebsiteUrl: "",
    clientLinkedInUrl: "",
    clientSpocName: [""],
    clientSpocEmailid: [""],
    clientSpocMobileNumber: [""],
    clientSpocLinkedin: [""],
    supportingDocuments: "", // This will store file name
    currency: "INR", // Added currency to initialValues
  };

  const handleFileChange = (event) => {
    const selectedFiles = event.currentTarget.files;
    if (selectedFiles.length === 0) {
      toast.warning("No file selected", toastConfig);
      return;
    }

    setFiles(Array.from(selectedFiles));
    toast.success("Files selected successfully!", toastConfig);
  };

  const removeFile = (indexToRemove) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
    toast.info("File removed", toastConfig);
  };

  const handleSubmit = async (values, { resetForm }) => {
    if (files.length === 0) {
      toast.warning(
        "Please upload at least one supporting document",
        toastConfig
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const byteArray = new Uint8Array(arrayBuffer);

          // Prepare submission values
          const submissionValues = {
            ...values,
            currency, // Ensure currency is included
            supportingDocuments: file.name,
          };

          const formData = new FormData();
          formData.append("dto", JSON.stringify(submissionValues));
          formData.append(
            "supportingDocuments",
            new Blob([byteArray]),
            file.name
          );

          const response = await axios.post(
            `${BASE_URL}/requirements/bdm/addClient`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          // Handle success response
          if (response.data && response.data.success) {
            const clientInfo = response.data.data
              ? `Client ${response.data.data.clientName} (ID: ${response.data.data.id}) added successfully!`
              : "Client added successfully!";
            toast.success(clientInfo, toastConfig);
          } else {
            toast.success(
              response.data.message || "Client added successfully!",
              toastConfig
            );
          }

          resetForm();
          setFiles([]);
          setIsSubmitting(false);
        } catch (error) {
          handleErrorResponse(error);
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read file", toastConfig);
        setIsSubmitting(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to process your request", toastConfig);
      setIsSubmitting(false);
    }
  };

  const handleSuccessResponse = (response, resetForm) => {
    // Display success toast with client ID
    if (response.data && response.data.success) {
      const clientInfo = response.data.data
        ? `Client ${response.data.data.clientName} (ID: ${response.data.data.id}) added successfully!`
        : response.data.message || "Client added successfully!";

      toast.success(clientInfo, toastConfig);
    } else {
      toast.success(
        response.data.message || "Client added successfully!",
        toastConfig
      );
    }

    resetForm();
    setFiles([]);
    setIsSubmitting(false);
  };

  const handleErrorResponse = (error) => {
    const errorMessage =
      error.response?.data?.message ||
      "Failed to submit form. Please try again.";
    toast.error(errorMessage, toastConfig);
    setIsSubmitting(false);
  };

  const addContactPerson = (values, setFieldValue) => {
    setFieldValue("clientSpocName", [...values.clientSpocName, ""]);
    setFieldValue("clientSpocEmailid", [...values.clientSpocEmailid, ""]);
    setFieldValue("clientSpocMobileNumber", [
      ...values.clientSpocMobileNumber,
      "",
    ]);
    setFieldValue("clientSpocLinkedin", [...values.clientSpocLinkedin, ""]);
    toast.info("New contact person added", toastConfig);
  };

  const removeContactPerson = (index, values, setFieldValue) => {
    if (values.clientSpocName.length > 1) {
      const newSpocNames = [...values.clientSpocName];
      newSpocNames.splice(index, 1);

      const newSpocEmails = [...values.clientSpocEmailid];
      newSpocEmails.splice(index, 1);

      const newSpocMobiles = [...values.clientSpocMobileNumber];
      newSpocMobiles.splice(index, 1);

      const newSpocLinkedIns = [...values.clientSpocLinkedin];
      newSpocLinkedIns.splice(index, 1);

      setFieldValue("clientSpocName", newSpocNames);
      setFieldValue("clientSpocEmailid", newSpocEmails);
      setFieldValue("clientSpocMobileNumber", newSpocMobiles);
      setFieldValue("clientSpocLinkedin", newSpocLinkedIns);

      toast.info("Contact person removed", toastConfig);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Toast container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Container maxWidth="xxl" sx={{ mt: 4, mb: 6 }}>
        <Card elevation={0} sx={{ overflow: "visible", mb: 6 }}>
          <CardHeader
            title="Client Information Form"
            sx={{
              bgcolor: "#00796b",
              color: "white",
              p: 3,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          />
          <CardContent sx={{ p: 4 }}>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, resetForm, setFieldValue }) => (
                <Form>
                  <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{ mb: 1, fontWeight: 500 }}
                      >
                        Basic Information
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Field name="clientName">
                        {({ field, meta }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Client Name"
                            placeholder="Enter client name"
                            required
                            error={meta.touched && Boolean(meta.error)}
                            helperText={meta.touched && meta.error}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Business color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      </Field>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Field name="positionType">
                        {({ field, form, meta }) => (
                          <FormControl
                            fullWidth
                            error={meta.touched && Boolean(meta.error)}
                          >
                            <InputLabel id="position-type-label">
                              Position Type
                            </InputLabel>
                            <Select
                              {...field}
                              labelId="position-type-label"
                              id="position-type"
                              value={field.value || ""}
                              onChange={(event) =>
                                form.setFieldValue(
                                  "positionType",
                                  event.target.value
                                )
                              }
                              displayEmpty
                              startAdornment={
                                <InputAdornment position="start">
                                  <WorkOutline color="primary" />
                                </InputAdornment>
                              }
                            >
                              <MenuItem value="" disabled>
                                Select Position Type
                              </MenuItem>
                              <MenuItem value="Full-Time">Full-Time</MenuItem>
                              <MenuItem value="Part-Time">Part-Time</MenuItem>
                              <MenuItem value="Contract">Contract</MenuItem>
                              <MenuItem value="Internship">Internship</MenuItem>
                            </Select>
                            {meta.touched && meta.error && (
                              <Typography variant="caption" color="error">
                                {meta.error}
                              </Typography>
                            )}
                          </FormControl>
                        )}
                      </Field>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Field name="clientWebsiteUrl">
                        {({ field, meta }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Client Website URL"
                            placeholder="https://"
                            error={meta.touched && Boolean(meta.error)}
                            helperText={meta.touched && meta.error}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Language color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      </Field>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Field name="clientLinkedInUrl">
                        {({ field, meta }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Client LinkedIn URL"
                            placeholder="https://linkedin.com/company/"
                            error={meta.touched && Boolean(meta.error)}
                            helperText={meta.touched && meta.error}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LinkedIn color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      </Field>
                    </Grid>

                    <Grid item xs={12} md={8}>
                      <Field name="clientAddress">
                        {({ field, meta }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Client Address"
                            placeholder="Enter complete address"
                            error={meta.touched && Boolean(meta.error)}
                            helperText={meta.touched && meta.error}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationOn color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      </Field>
                    </Grid>

                    {/* Payment Information */}
                    <Grid item xs={12}>
                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{ mt: 1, mb: 1, fontWeight: 500 }}
                      >
                        Payment Information
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        select
                        label="Currency"
                        value={currency}
                        onChange={(e) => {
                          setCurrency(e.target.value);
                          setFieldValue("currency", e.target.value);
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      >
                        <MenuItem value="INR">Rupee (INR)</MenuItem>
                        <MenuItem value="USD">Dollar (USD)</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Field name="netPayment">
                        {({ field, meta }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Net Payment"
                            placeholder="0"
                            type="number"
                            error={meta.touched && Boolean(meta.error)}
                            helperText={meta.touched && meta.error}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  Days
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      </Field>
                    </Grid>

                    {currency === "INR" && (
                      <>
                        <Grid item xs={12} sm={6} md={3}>
                          <Field name="gst">
                            {({ field, meta }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="GST"
                                placeholder="0"
                                type="number"
                                error={meta.touched && Boolean(meta.error)}
                                helperText={meta.touched && meta.error}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Percent color="primary" />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            )}
                          </Field>
                        </Grid>

                        <Grid item xs={12}>
                          <Typography
                            variant="h6"
                            color="primary"
                            sx={{
                              mt: 1,
                              mb: 1,
                              fontWeight: 500,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <People sx={{ mr: 1 }} />
                            Supporting Customers
                          </Typography>
                          <Divider sx={{ mb: 3 }} />
                        </Grid>

                        <Grid item xs={12}>
                          <FieldArray name="supportingCustomers">
                            {({ push, remove }) => (
                              <Box>
                                {values.supportingCustomers &&
                                values.supportingCustomers.length > 0 ? (
                                  <Paper
                                    variant="outlined"
                                    sx={{ p: 2, mb: 2, borderRadius: 2 }}
                                  >
                                    <Grid container spacing={2}>
                                      {values.supportingCustomers.map(
                                        (customer, index) => (
                                          <Grid
                                            item
                                            xs={12}
                                            sm={6}
                                            md={3}
                                            key={index}
                                          >
                                            <Box
                                              sx={{ display: "flex", gap: 1 }}
                                            >
                                              <Field
                                                name={`supportingCustomers.${index}`}
                                              >
                                                {({ field, meta }) => (
                                                  <TextField
                                                    {...field}
                                                    fullWidth
                                                    placeholder={`Customer ${
                                                      index + 1
                                                    }`}
                                                    error={
                                                      meta.touched &&
                                                      Boolean(meta.error)
                                                    }
                                                    helperText={
                                                      meta.touched && meta.error
                                                    }
                                                    variant="outlined"
                                                    size="medium"
                                                  />
                                                )}
                                              </Field>
                                              <IconButton
                                                color="error"
                                                onClick={() => {
                                                  remove(index);
                                                  toast.info(
                                                    "Customer removed",
                                                    toastConfig
                                                  );
                                                }}
                                                sx={{
                                                  border: "1px solid",
                                                  borderColor: "divider",
                                                  borderRadius: 2,
                                                }}
                                              >
                                                <RemoveCircleOutline />
                                              </IconButton>
                                            </Box>
                                          </Grid>
                                        )
                                      )}
                                    </Grid>
                                  </Paper>
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2, fontStyle: "italic" }}
                                  >
                                    No supporting customers added
                                  </Typography>
                                )}
                                <Button
                                  startIcon={<AddCircleOutline />}
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => {
                                    push("");
                                    toast.info(
                                      "New customer field added",
                                      toastConfig
                                    );
                                  }}
                                  sx={{ mt: 1 }}
                                >
                                  Add Customer
                                </Button>
                              </Box>
                            )}
                          </FieldArray>
                        </Grid>
                      </>
                    )}

                    {/* Contact Persons */}
                    <Grid item xs={12}>
                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{
                          mt: 1,
                          mb: 1,
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Person sx={{ mr: 1 }} />
                        Contact Information
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                      {/* Add Contact Person button moved outside the box */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          mt: 2,
                          mb: 3,
                        }}
                      >
                        <Button
                          startIcon={<AddCircleOutline />}
                          variant="outlined"
                          color="primary"
                          onClick={() =>
                            addContactPerson(values, setFieldValue)
                          }
                        >
                          Add Contact Person
                        </Button>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      {values.clientSpocName.map((name, index) => (
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, borderRadius: 2, mb: 2 }}
                          key={index}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                              <Field name={`clientSpocName.${index}`}>
                                {({ field, meta }) => (
                                  <TextField
                                    {...field}
                                    fullWidth
                                    label="Contact Name"
                                    error={meta.touched && Boolean(meta.error)}
                                    helperText={meta.touched && meta.error}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Person color="primary" />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                )}
                              </Field>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Field name={`clientSpocEmailid.${index}`}>
                                {({ field, meta }) => (
                                  <TextField
                                    {...field}
                                    fullWidth
                                    label="Contact Email"
                                    error={meta.touched && Boolean(meta.error)}
                                    helperText={meta.touched && meta.error}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Email color="primary" />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                )}
                              </Field>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Field name={`clientSpocMobileNumber.${index}`}>
                                {({ field, meta }) => (
                                  <TextField
                                    {...field}
                                    fullWidth
                                    label="Contact Mobile"
                                    placeholder="10-digit number"
                                    error={meta.touched && Boolean(meta.error)}
                                    helperText={meta.touched && meta.error}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Phone color="primary" />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                )}
                              </Field>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Field name={`clientSpocLinkedin.${index}`}>
                                {({ field, meta }) => (
                                  <TextField
                                    {...field}
                                    fullWidth
                                    label="Contact LinkedIn"
                                    placeholder="https://linkedin.com/in/"
                                    error={meta.touched && Boolean(meta.error)}
                                    helperText={meta.touched && meta.error}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <LinkedIn color="primary" />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                )}
                              </Field>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <IconButton
                                color="error"
                                onClick={() =>
                                  removeContactPerson(
                                    index,
                                    values,
                                    setFieldValue
                                  )
                                }
                                disabled={values.clientSpocName.length === 1}
                                sx={{
                                  border: "1px solid",
                                  borderColor: "divider",
                                  borderRadius: 2,
                                }}
                              >
                                <RemoveCircleOutline />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}
                    </Grid>

                    {/* Supporting Documents */}
                    <Grid item xs={12}>
                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{
                          mt: 1,
                          mb: 1,
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <AttachFile sx={{ mr: 1 }} />
                        Supporting Documents
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: "rgba(0, 0, 0, 0.01)",
                        }}
                      >
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<AttachFile />}
                          size="large"
                          sx={{ mb: 2 }}
                        >
                          Upload Files
                          <input
                            type="file"
                            hidden
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                        </Button>

                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          {files.length > 0 ? (
                            files.map((file, index) => (
                              <Chip
                                key={index}
                                label={file.name}
                                onDelete={() => removeFile(index)}
                                color="primary"
                                variant="outlined"
                                sx={{ py: 0.5 }}
                              />
                            ))
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontStyle: "italic" }}
                            >
                              No files selected. Please upload at least one
                              supporting document.
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Form Buttons */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 3 }} />
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        justifyContent="flex-end"
                      >
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => {
                            resetForm();
                            setFiles([]);
                            toast.info("Form has been reset", toastConfig);
                          }}
                          startIcon={<RestartAlt />}
                          size="large"
                          sx={{ px: 4 }}
                        >
                          Reset Form
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={isSubmitting}
                          startIcon={
                            isSubmitting ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <Save />
                            )
                          }
                          size="large"
                          sx={{ px: 4 }}
                        >
                          {isSubmitting ? "Submitting..." : "Add Client"}
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default ClientForm;
