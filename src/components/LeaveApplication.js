import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Stack,
  Alert,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import InfoIcon from "@mui/icons-material/Info";
import ClearIcon from "@mui/icons-material/Clear";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import dayjs from "dayjs";
import { useSelector, useDispatch } from "react-redux";
import { fetchEmployees } from "../redux/features/employeesSlice";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../redux/config";

const LEAVE_TYPES = [
  {
    value: "Sick Leave",
    label: "Sick Leave",
    description: "For medical and health-related absences",
  },
  {
    value: "Paid Leave",
    label: "Paid Leave",
    description: "Regular paid time off",
  },
  {
    value: "Casual Leave",
    label: "Casual Leave",
    description: "For personal matters and emergencies",
  },
  {
    value: "Annual",
    label: "Annual Leave",
    description: "Yearly vacation leave",
  },
];

const LeaveApplication = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { employeesList } = useSelector((state) => state.employees);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    userId: user || "",
    startDate: null,
    endDate: null,
    noOfDays: 0,
    leaveType: "",
    managerEmail: [],
    description: "",
  });

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const activeManagers = employeesList.filter(
    (emp) => emp.roles === "SUPERADMIN" && emp.status === "ACTIVE"
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
      noOfDays:
        name === "endDate"
          ? calculateDays(prev.startDate, date)
          : prev.noOfDays,
    }));
    setErrorMessage("");
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    return dayjs(end).diff(dayjs(start), "day") + 1;
  };

  const handleClear = () => {
    setFormData({
      userId: user || "",
      startDate: null,
      endDate: null,
      noOfDays: 0,
      leaveType: "",
      managerEmail: [],
      description: "",
    });
    setErrorMessage("");
  };

  const validateForm = () => {
    if (!formData.startDate) return "Start date is required";
    if (!formData.endDate) return "End date is required";
    if (!formData.leaveType) return "Leave type is required";
    if (formData.managerEmail.length === 0)
      return "Please select at least one manager";
    if (!formData.description.trim()) return "Description is required";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const error = validateForm();
    if (error) {
      setErrorMessage(error);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        startDate: dayjs(formData.startDate).format("YYYY-MM-DD"),
        endDate: dayjs(formData.endDate).format("YYYY-MM-DD"),
      };

      const response = await axios.post(`${BASE_URL}/users/save`, payload);

      if (response.status === 200) {
        setSuccessData(response.data);
        setSuccessDialogOpen(true);
        handleClear();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit leave application"
      );
    } finally {
      setLoading(false);
    }
  };

  const SuccessDialog = () => (
    <Dialog
      open={successDialogOpen}
      onClose={() => setSuccessDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          bgcolor: "#00796b",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <CheckCircleIcon />
        Leave Application Submitted Successfully
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 2 }}>
            <Typography variant="subtitle2">Employee ID:</Typography>
            <Typography>{successData?.userId}</Typography>

            <Typography variant="subtitle2">Leave Type:</Typography>
            <Typography>{successData?.leaveType}</Typography>

            <Typography variant="subtitle2">Date Range:</Typography>
            <Typography>
              {dayjs(successData?.startDate).format("DD MMM YYYY")} -{" "}
              {dayjs(successData?.endDate).format("DD MMM YYYY")}
              <Typography component="span" color="primary.main" sx={{ ml: 1 }}>
                ({successData?.noOfDays} days)
              </Typography>
            </Typography>

            <Typography variant="subtitle2">Manager:</Typography>
            <Typography>{successData?.managerEmail.join(", ")}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Description:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                bgcolor: "grey.50",
                p: 2,
                borderRadius: 1,
                whiteSpace: "pre-wrap",
              }}
            >
              {successData?.description}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setSuccessDialogOpen(false)}
          variant="contained"
          color="primary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 800,
          mx: "auto",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={3}>
          <Divider />

          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage("")}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Previous form fields remain the same */}
            <Grid container spacing={3}>
              {/* Employee ID */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  name="userId"
                  value={formData.userId}
                  disabled
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <Tooltip title="Your Employee ID">
                        <IconButton size="small" sx={{ mr: 1 }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ),
                  }}
                />
              </Grid>

              {/* Leave Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleChange}
                    error={Boolean(errorMessage && !formData.leaveType)}
                  >
                    {LEAVE_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Tooltip title={type.description} placement="right">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {type.label}
                            <InfoIcon
                              fontSize="small"
                              sx={{ ml: 1, opacity: 0.6 }}
                            />
                          </Box>
                        </Tooltip>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Date Selection */}
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange("startDate", date)}
                  minDate={dayjs().subtract(1, "month")} // Allows selecting up to one month before today
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errorMessage && !formData.startDate),
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange("endDate", date)}
                  disablePast
                  minDate={formData.startDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errorMessage && !formData.endDate),
                    },
                  }}
                />
              </Grid>

              {/* Number of Days */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Number of Days"
                  value={formData.noOfDays}
                  disabled
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <Tooltip title="Automatically calculated based on date range">
                        <IconButton size="small" sx={{ mr: 1 }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ),
                  }}
                />
              </Grid>

              {/* Manager Selection */}
              <Grid item xs={12} sm={6} sx={{ height: 100 }}>
                <FormControl
                  fullWidth
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  error={Boolean(
                    errorMessage && formData.managerEmail.length === 0
                  )}
                >
                  <InputLabel>Reporting Manager</InputLabel>
                  <Select
                    multiple
                    name="managerEmail"
                    value={formData.managerEmail}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        managerEmail: event.target.value,
                      }))
                    }
                    renderValue={(selected) => selected.join(", ")}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 200, // Fixed height for dropdown
                          overflowY: "auto", // Scrollbar for dropdown
                        },
                      },
                    }}
                    sx={{
                      flexGrow: 1,
                      minHeight: 40, // Ensures visibility
                    }}
                  >
                    {activeManagers.length > 0 ? (
                      activeManagers.map((manager) => (
                        <MenuItem
                          key={manager.employeeId}
                          value={manager.email}
                        >
                          <Checkbox
                            checked={
                              formData.managerEmail.indexOf(manager.email) > -1
                            }
                            color="primary"
                          />
                          <ListItemText
                            primary={manager.userName}
                            secondary={manager.email}
                          />
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        <Typography color="error">
                          No managers available
                        </Typography>
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Leave Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  variant="outlined"
                  error={Boolean(errorMessage && !formData.description)}
                  helperText="Please provide detailed reason for your leave"
                  placeholder="Enter the reason for your leave request..."
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box
              sx={{
                mt: 4,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleClear}
                disabled={loading}
                startIcon={<ClearIcon />}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <SendIcon />
                }
              >
                Apply Leave
              </Button>
            </Box>
          </Box>
        </Stack>

        <SuccessDialog />
      </Paper>
    </LocalizationProvider>
  );
};

export default LeaveApplication;
