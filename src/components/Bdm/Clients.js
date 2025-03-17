import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "../MuiComponents/DataTable";
import { 
  CircularProgress, 
  Box, 
  Container, 
  Link, 
  IconButton, 
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  Grid,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Paper
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BASE_URL from "../../redux/config";

// const BASE_URL  = 'http://192.168.0.194:8111'

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [files, setFiles] = useState([]);
  const [formFeedback, setFormFeedback] = useState({ show: false, type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prepopulatedFileName, setPrepopulatedFileName] = useState('');
  

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/requirements/bdm/getAll`);

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setClients(response.data.data);
      } else if (Array.isArray(response.data)) {
        setClients(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setClients([]);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileDownload = async (clientId) => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${BASE_URL}/requirements/bdm/${clientId}/download`, {
        responseType: "blob", 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      let filename = `client_${clientId}_documents.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) filename = filenameMatch[1];
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("File downloaded successfully!");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (clientId) => {
    const clientToEdit = clients.find(client => client.id === clientId);
    if (clientToEdit) {
      setCurrentClient(clientToEdit);
      setEditDialogOpen(true);
      setPrepopulatedFileName(clientToEdit.supportingDocuments);
    } else {
      toast.error("Client not found");
    }
  };

  const handleEdit = async (values) => {
    if (files.length === 0 && !currentClient.supportingDocuments) {
      setFormFeedback({
        show: true,
        type: 'warning',
        message: 'Please upload at least one supporting document'
      });
      setTimeout(() => setFormFeedback({ show: false, type: '', message: '' }), 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      if (currentClient && currentClient.id) {
        values.id = currentClient.id;
      }

      formData.append('dto', JSON.stringify(values));

      if (files.length > 0) {
        const file = files[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
          const arrayBuffer = event.target.result;
          const byteArray = new Uint8Array(arrayBuffer);

          formData.append('supportingDocuments', new Blob([byteArray]), file.name);

          try {
            const response = await axios.put(`${BASE_URL}/requirements/bdm/${currentClient.id}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

            setFormFeedback({
              show: true,
              type: 'success',
              message: response.data.message || 'Client updated successfully!'
            });

            setFiles([]);
            setIsSubmitting(false);
            setEditDialogOpen(false);
            setCurrentClient(null);
            fetchClients();
            setTimeout(() => setFormFeedback({ show: false, type: '', message: '' }), 3000);
          } catch (error) {
            setFormFeedback({
              show: true,
              type: 'error',
              message: error.response?.data?.message || 'Failed to update client. Please try again.'
            });
            setTimeout(() => setFormFeedback({ show: false, type: '', message: '' }), 3000);
            setIsSubmitting(false);
          }
        };

        reader.onerror = () => {
          setFormFeedback({
            show: true,
            type: 'error',
            message: 'Failed to read file'
          });
          setTimeout(() => setFormFeedback({ show: false, type: '', message: '' }), 3000);
          setIsSubmitting(false);
        };

        reader.readAsArrayBuffer(file);
      } else {
        try {
          const response = await axios.put(`${BASE_URL}/requirements/bdm/${currentClient.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          setFormFeedback({
            show: true,
            type: 'success',
            message: response.data.message || 'Client updated successfully!'
          });

          setIsSubmitting(false);
          setEditDialogOpen(false);
          setCurrentClient(null);
          fetchClients();
          setTimeout(() => setFormFeedback({ show: false, type: '', message: '' }), 3000);
        } catch (error) {
          setFormFeedback({
            show: true,
            type: 'error',
            message: error.response?.data?.message || 'Failed to update client. Please try again.'
          });
          setTimeout(() => setFormFeedback({ show: false, type: '', message: '' }), 3000);
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.error('Error updating client:', error);
      setFormFeedback({
        show: true,
        type: 'error',
        message: 'Failed to process your request'
      });
      setTimeout(() => setFormFeedback({ show: false, type: '', message: '' }), 3000);
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      setLoading(true);
      await axios.delete(`${BASE_URL}/bdm/${clientToDelete.id}`);
      setClients(clients.filter(client => client.id !== clientToDelete.id));
      toast.success("Client deleted successfully!");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setCurrentClient(null);
    setFiles([]);
    setPrepopulatedFileName('');
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setFiles(Array.from(event.target.files));
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const validationSchema = Yup.object().shape({
    clientName: Yup.string().required("Client name is required"),
    clientAddress: Yup.string().required("Client address is required"),
    positionType: Yup.string().required("Position type is required"),
    netPayment: Yup.number().required("Net payment is required").positive(),
    gst: Yup.number().required("GST is required").min(0).max(100),
    clientWebsiteUrl: Yup.string().url("Enter a valid URL").required("Website URL is required"),
    clientLinkedInUrl: Yup.string().url("Enter a valid LinkedIn URL"),
  });

  const generateColumns = (handleFileDownload, handleEditClick, handleDeleteClick) => {
    return [
      { key: "id", label: "Client ID", type: "text" },
      { key: "clientName", label: "Client Name", type: "text" },
      { key: "clientAddress", label: "Address", type: "text" },
      { key: "positionType", label: "Position Type", type: "select" },
      { key: "netPayment", label: "Net Payment", type: "number" },
      { key: "gst", label: "GST (%)", type: "number" },
      {
        key: "supportingCustomers",
        label: "Supporting Customers",
        type: "text",
        render: (row) => (
          <Box sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
            {Array.isArray(row.supportingCustomers)
              ? row.supportingCustomers.join(", ")
              : "N/A"}
          </Box>
        ),
      },
      {
        key: "clientWebsiteUrl",
        label: "Website",
        type: "text",
        render: (row) =>
          row.clientWebsiteUrl ? (
            <Link href={row.clientWebsiteUrl} target="_blank" rel="noopener noreferrer">
              Go to Website
            </Link>
          ) : (
            "N/A"
          ),
      },
      {
        key: "clientLinkedInUrl",
        label: "LinkedIn",
        type: "text",
        render: (row) =>
          row.clientLinkedInUrl ? (
            <Link href={row.clientLinkedInUrl} target="_blank" rel="noopener noreferrer">
              Go to LinkedIn
            </Link>
          ) : (
            "N/A"
          ),
      },
      {
        key: "clientSpocName",
        label: "SPOC Name",
        type: "text",
        render: (row) => (
          <Box sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
            {Array.isArray(row.clientSpocName)
              ? row.clientSpocName.join(", ")
              : "N/A"}
          </Box>
        ),
      },
      {
        key: "clientSpocEmailid",
        label: "SPOC Email",
        type: "text",
        render: (row) => (
          <Box sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
            {Array.isArray(row.clientSpocEmailid)
              ? row.clientSpocEmailid.join(", ")
              : "N/A"}
          </Box>
        ),
      },
      {
        key: "clientSpocMobileNumber",
        label: "SPOC Mobile",
        type: "text",
        render: (row) => (
          <Box sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
            {Array.isArray(row.clientSpocMobileNumber)
              ? row.clientSpocMobileNumber.join(", ")
              : "N/A"}
          </Box>
        ),
      },
      {
        key: "clientSpocLinkedin",
        label: "SPOC LinkedIn",
        type: "text",
        render: (row) =>
          row.clientSpocLinkedin ? (
            <Link href={row.clientSpocLinkedin} target="_blank" rel="noopener noreferrer">
              View LinkedIn
            </Link>
          ) : (
            "N/A"
          ),
      },
      {
        key: "supportingDocuments",
        label: "Documents",
        render: (row) => (
          <Link
            onClick={() => handleFileDownload(row.id)}
            sx={{
              cursor: "pointer",
              color: "#2A4DBD",
              fontWeight: 500,
              textDecoration: "none",
              "&:hover": {
                color: "#0F1C46",
                textDecoration: "underline",
              },
            }}
          >
            Download
          </Link>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (row) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Edit Client">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEditClick(row.id)}
                aria-label="edit"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Client">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteClick(row)}
                aria-label="delete"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ];
  };
  
  
  

  if (loading && !editDialogOpen && !deleteDialogOpen) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: "100%",
        height: "calc(100vh - 20px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DataTable
        data={clients}
        columns={generateColumns(handleFileDownload, handleEditClick, handleDeleteClick)}
        title="Clients"
        pageLimit={10}
        onRefresh={fetchClients}
        isRefreshing={loading}
      />

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        maxWidth="md"
        fullWidth
        aria-labelledby="edit-dialog-title"
      >
        <DialogTitle id="edit-dialog-title">
          Edit Client: {currentClient?.clientName}
        </DialogTitle>
        <DialogContent dividers>
          {formFeedback.show && (
            <Alert severity={formFeedback.type} sx={{ mb: 2 }}>
              {formFeedback.message}
            </Alert>
          )}
          
          {currentClient && (
            <Formik
              initialValues={{
                clientName: currentClient.clientName || "",
                clientAddress: currentClient.clientAddress || "",
                positionType: currentClient.positionType || "",
                netPayment: currentClient.netPayment || 0,
                gst: currentClient.gst || 0,
                supportingCustomers: Array.isArray(currentClient.supportingCustomers) 
                  ? currentClient.supportingCustomers 
                  : [],
                clientWebsiteUrl: currentClient.clientWebsiteUrl || "",
                clientLinkedInUrl: currentClient.clientLinkedInUrl || "",
                clientSpocName: Array.isArray(currentClient.clientSpocName) 
                  ? currentClient.clientSpocName 
                  : [],
                clientSpocEmailid: Array.isArray(currentClient.clientSpocEmailid) 
                  ? currentClient.clientSpocEmailid 
                  : [],
                clientSpocLinkedin: Array.isArray(currentClient.clientSpocLinkedin)
                  ? currentClient.clientSpocLinkedin
                  : [],
                clientSpocMobileNumber: Array.isArray(currentClient.clientSpocMobileNumber)
                  ? currentClient.clientSpocMobileNumber
                  : [],
                paymentType: currentClient.paymentType || "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleEdit}
            >
              {({ errors, touched, values, handleChange, setFieldValue }) => (
                <Form>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="clientName"
                        name="clientName"
                        label="Client Name"
                        value={values.clientName}
                        onChange={handleChange}
                        error={touched.clientName && Boolean(errors.clientName)}
                        helperText={touched.clientName && errors.clientName}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="clientAddress"
                        name="clientAddress"
                        label="Client Address"
                        value={values.clientAddress}
                        onChange={handleChange}
                        error={touched.clientAddress && Boolean(errors.clientAddress)}
                        helperText={touched.clientAddress && errors.clientAddress}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth margin="normal" variant="outlined">
                        <InputLabel id="positionType-label">Position Type</InputLabel>
                        <Select
                          labelId="positionType-label"
                          id="positionType"
                          name="positionType"
                          value={values.positionType}
                          onChange={handleChange}
                          label="Position Type"
                          error={touched.positionType && Boolean(errors.positionType)}
                        >
                          <MenuItem value="Permanent">Permanent</MenuItem>
                          <MenuItem value="Contract">Contract</MenuItem>
                          <MenuItem value="Freelance">Freelance</MenuItem>
                          <MenuItem value="Full-Time">Full-Time</MenuItem>
                          <MenuItem value="Part-Time">Part-Time</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        id="netPayment"
                        name="netPayment"
                        label="Net Payment"
                        type="number"
                        value={values.netPayment}
                        onChange={handleChange}
                        error={touched.netPayment && Boolean(errors.netPayment)}
                        helperText={touched.netPayment && errors.netPayment}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        id="gst"
                        name="gst"
                        label="GST (%)"
                        type="number"
                        value={values.gst}
                        onChange={handleChange}
                        error={touched.gst && Boolean(errors.gst)}
                        helperText={touched.gst && errors.gst}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    {/* <Grid item xs={12} md={4}>
                      <FormControl fullWidth margin="normal" variant="outlined">
                        <InputLabel id="paymentType-label">Payment Type</InputLabel>
                        <Select
                          labelId="paymentType-label"
                          id="paymentType"
                          name="paymentType"
                          value={values.paymentType || ""}
                          onChange={handleChange}
                          label="Payment Type"
                        >
                          <MenuItem value=""><em>None</em></MenuItem>
                          <MenuItem value="Monthly">Monthly</MenuItem>
                          <MenuItem value="Quarterly">Quarterly</MenuItem>
                          <MenuItem value="Annually">Annually</MenuItem>
                          <MenuItem value="One-Time">One-Time</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid> */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="supportingCustomers"
                        name="supportingCustomers"
                        label="Supporting Customers (comma separated)"
                        value={Array.isArray(values.supportingCustomers) ? values.supportingCustomers.join(", ") : ""}
                        onChange={(e) => {
                          const customersArray = e.target.value
                            .split(",")
                            .map(item => item.trim())
                            .filter(item => item !== "");
                          setFieldValue("supportingCustomers", customersArray);
                        }}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="clientWebsiteUrl"
                        name="clientWebsiteUrl"
                        label="Website URL"
                        value={values.clientWebsiteUrl}
                        onChange={handleChange}
                        error={touched.clientWebsiteUrl && Boolean(errors.clientWebsiteUrl)}
                        helperText={touched.clientWebsiteUrl && errors.clientWebsiteUrl}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="clientLinkedInUrl"
                        name="clientLinkedInUrl"
                        label="LinkedIn URL"
                        value={values.clientLinkedInUrl}
                        onChange={handleChange}
                        error={touched.clientLinkedInUrl && Boolean(errors.clientLinkedInUrl)}
                        helperText={touched.clientLinkedInUrl && errors.clientLinkedInUrl}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="clientSpocName"
                        name="clientSpocName"
                        label="SPOC Names (comma separated)"
                        value={Array.isArray(values.clientSpocName) ? values.clientSpocName.join(", ") : ""}
                        onChange={(e) => {
                          const namesArray = e.target.value
                            .split(",")
                            .map(item => item.trim())
                            .filter(item => item !== "");
                          setFieldValue("clientSpocName", namesArray);
                        }}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="clientSpocEmailid"
                        name="clientSpocEmailid"
                        label="SPOC Emails (comma separated)"
                        value={Array.isArray(values.clientSpocEmailid) ? values.clientSpocEmailid.join(", ") : ""}
                        onChange={(e) => {
                          const emailsArray = e.target.value
                            .split(",")
                            .map(item => item.trim())
                            .filter(item => item !== "");
                          setFieldValue("clientSpocEmailid", emailsArray);
                        }}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="clientSpocMobileNumber"
                        name="clientSpocMobileNumber"
                        label="SPOC Mobile Numbers (comma separated)"
                        value={Array.isArray(values.clientSpocMobileNumber) ? values.clientSpocMobileNumber.join(", ") : ""}
                        onChange={(e) => {
                          const mobileArray = e.target.value
                            .split(",")
                            .map(item => item.trim())
                            .filter(item => item !== "");
                          setFieldValue("clientSpocMobileNumber", mobileArray);
                        }}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="clientSpocLinkedin"
                        name="clientSpocLinkedin"
                        label="SPOC LinkedIn URLs (comma separated)"
                        value={Array.isArray(values.clientSpocLinkedin) ? values.clientSpocLinkedin.join(", ") : ""}
                        onChange={(e) => {
                          const linkedinArray = e.target.value
                            .split(",")
                            .map(item => item.trim())
                            .filter(item => item !== "");
                          setFieldValue("clientSpocLinkedin", linkedinArray);
                        }}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: '1px dashed #aaa',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          my: 2,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          {files.length > 0 
                            ? `Selected file: ${files[0].name}` 
                            : prepopulatedFileName ? `Current Document: ${prepopulatedFileName}` : "Update supporting document (optional)"}
                        </Typography>
                        <Button
                          component="label"
                          variant="contained"
                          startIcon={<CloudUploadIcon />}
                          sx={{ mt: 1 }}
                        >
                          Upload File
                          <input
                            type="file"
                            hidden
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                        </Button>
                      </Paper>
                    </Grid>
                  </Grid>
                  <DialogActions sx={{ mt: 3 }}>
                    <Button onClick={handleEditClose} color="primary">
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <CircularProgress size={24} /> : "Save Changes"}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete client "{clientToDelete?.clientName}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Clients;