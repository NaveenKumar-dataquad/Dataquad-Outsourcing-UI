import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployees,
  updateEmployee,
  deleteEmployee,
  resetUpdateStatus,
} from "../../redux/features/employeesSlice";
import {
  CircularProgress,
  Box,
  Typography,
  Paper,
  Container,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import DataTable from "../MuiComponents/DataTable";
import SaveIcon from "@mui/icons-material/Save";
import SectionHeader from "../MuiComponents/SectionHeader";
import ListAltIcon from "@mui/icons-material/ListAlt";

const UsersList = () => {
  const dispatch = useDispatch();
  const { employeesList, fetchStatus, fetchError, updateStatus, updateError } =
    useSelector((state) => state.employees);
  const { roles, user } = useSelector((state) => state.auth);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const VALID_ROLES = ["SUPERADMIN", "EMPLOYEE", "ADMIN", "TEAMLEAD",'BDM',"PARTNER"];

  // Validation regex patterns
  const personalEmailRegex = /^[a-z0-9._%+-]+@gmail\.com$/;
  const emailRegex = /^[a-z0-9._%+-]+@dataqinc\.com$/;
  const phoneRegex = /^[0-9]{10}$/;
  const userIdRegex = /^DQIND\d{2,4}$/;

  const [formErrors, setFormErrors] = useState({
    personalemail: "",
    email: "",
    phoneNumber: "",
    employeeId: "",
  });

  const renderActionsColumn = (employee) => {
    const currentUser = user;
    const isSuperAdmin = roles.includes("SUPERADMIN");
    const isTeamLead = roles.includes("TEAMLEAD");

    // Prevent editing/deleting SUPERADMIN unless logged-in user is also SUPERADMIN
    const cannotEditSuperAdmin =
      employee.roles.includes("SUPERADMIN") && isSuperAdmin;

    // TEAMLEAD should not be able to edit or delete anyone
    const isTeamLeadRestricted =
      isTeamLead && employee.employeeId !== currentUser;

    // Disable if user is another SUPERADMIN or TEAMLEAD trying to edit others
    const isDisabled = cannotEditSuperAdmin || isTeamLeadRestricted;

    return (
      <Box display="flex" alignItems="center">
        <Tooltip title="Edit">
          <span>
            <IconButton
              color="primary"
              onClick={() => handleOpenEditDialog(employee)}
              disabled={isDisabled}
              sx={{ ml: 1 }}
            >
              <EditIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Delete">
          <span>
            <IconButton
              color="error"
              onClick={() => handleDeleteEmployee(employee.employeeId)}
              disabled={isDisabled}
              sx={{ ml: 1 }}
            >
              <DeleteIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    );
  };

  const fetchEmp = () => {
    dispatch(fetchEmployees());
  };

  // ✅ Optimized canEditUser function
  const canEditUser = (employeeToEdit) => {
    const currentUser = user;
    const isSuperAdmin = roles.includes("SUPERADMIN");
    const isTeamLead = roles.includes("TEAMLEAD");

    // SUPERADMIN can edit any user except another SUPERADMIN
    if (isSuperAdmin) {
      return !employeeToEdit.roles.includes("SUPERADMIN");
    }

    // TEAMLEAD cannot edit anyone except themselves
    if (isTeamLead && employeeToEdit.employeeId !== currentUser) {
      return false;
    }

    // Users can always edit their own details
    return employeeToEdit.employeeId === currentUser;
  };

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (updateStatus === "succeeded") {
      setSnackbar({
        open: true,
        message: "Employee updated successfully!",
        severity: "success",
      });
      handleCloseEditDialog();
      dispatch(fetchEmployees());
    } else if (updateStatus === "failed") {
      setSnackbar({
        open: true,
        message: updateError || "Failed to update employee",
        severity: "error",
      });
    }
  }, [updateStatus, updateError, dispatch]);

  const handleDeleteEmployee = (employeeId) => {
    const employeeToDelete = employeesList.find(
      (emp) => emp.employeeId === employeeId
    );
    if (!canEditUser(employeeToDelete)) {
      setSnackbar({
        open: true,
        message: "You don't have permission to delete this user.",
        severity: "error",
      });
      return;
    }
    setEmployeeToDelete(employeeId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      dispatch(deleteEmployee(employeeToDelete)).then(() => {
        setSnackbar({
          open: true,
          message: "Employee deleted successfully!",
          severity: "success",
        });
        dispatch(fetchEmployees());
      });
    }
    handleCloseDeleteDialog();
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenEditDialog = (employee) => {
    const currentUser = user; // Logged-in user

    // Prevent Super Admins from editing other Super Admins
    if (
      roles.includes("SUPERADMIN") &&
      employee.roles === "SUPERADMIN" &&
      employee.employeeId !== currentUser
    ) {
      setSnackbar({
        open: true,
        message: "You don't have permission to edit this user.",
        severity: "error",
      });
      return;
    }

    // Allow editing if conditions are met
    setSelectedEmployee(employee);
    const currentRoles = Array.isArray(employee.roles)
      ? employee.roles
      : typeof employee.roles === "string"
      ? employee.roles.split(", ")
      : [];
    setEditFormData({
      ...employee,
      roles: currentRoles,
    });
    setEditDialogOpen(true);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // Function to highlight matched text
  const highlightText = (text, query) => {
    if (!query.trim() || !text) return text;

    const parts = String(text).split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span
          key={index}
          style={{ backgroundColor: "#F6C90E", padding: "0.1rem" }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const columns = [
    { key: "employeeId", label: "Employee ID", type: "select" },
    { key: "userName", label: "User Name", type: "text" },
    { key: "roles", label: "Roles", type: "select" },
    { key: "email", label: "Email", type: "text" },
    { key: "designation", label: "Designation", type: "text" },
    { key: "joiningDate", label: "Joining Date", type: "select" },
    { key: "gender", label: "Gender", type: "select" },
    { key: "dob", label: "Date of Birth", type: "select" },
    { key: "phoneNumber", label: "Phone Number", type: "text" },
    { key: "personalemail", label: "Personal Email" },
    { key: "status", label: "Status", type: "select" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => renderActionsColumn(row),
    },
  ];

  // Filter employees based on global search
  const filteredEmployees = employeesList.filter((employee) =>
    Object.values(employee).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedEmployee(null);
    setEditFormData({});
    setFormErrors({});
    dispatch(resetUpdateStatus());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let errors = { ...formErrors };

    switch (name) {
      case "personalemail":
        errors.personalemail = !personalEmailRegex.test(value)
          ? "Invalid Gmail address"
          : "";
        break;
      case "email":
        errors.email = !emailRegex.test(value)
          ? "Invalid DataQ email address"
          : "";
        break;
      case "phoneNumber":
        errors.phoneNumber = !phoneRegex.test(value)
          ? "Phone number must be 10 digits"
          : "";
        break;
      case "userId":
        errors.userId = !userIdRegex.test(value)
          ? "User ID must match DQINDXX format"
          : "";
        break;
      default:
        break;
    }

    setFormErrors(errors);
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();

    // Validate all fields
    const errors = {};
    if (
      editFormData.personalemail &&
      !personalEmailRegex.test(editFormData.personalemail)
    ) {
      errors.personalemail = "Invalid Gmail address";
    }
    if (!editFormData.roles || editFormData.roles.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one role.",
        severity: "error",
      });
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const normalizedData = {
      ...editFormData,
      roles: Array.isArray(editFormData.roles)
        ? editFormData.roles
        : [editFormData.roles],
    };

    dispatch(updateEmployee(normalizedData));
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const renderRolesField = (key) => {
    const availableRoles = VALID_ROLES; // Show all roles
    return (
      <FormControl fullWidth key={key}>
        <InputLabel>Role</InputLabel>
        <Select
          name="roles"
          value={editFormData.roles ? editFormData.roles[0] : ""}
          onChange={(event) => {
            setEditFormData((prev) => ({
              ...prev,
              roles: [event.target.value], // Ensure only one role is selected
            }));
          }}
          label="Role"
        >
          {availableRoles.map((role) => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  const paginatedEmployees = employeesList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container
      maxWidth={false} // 1) No fixed max width
      disableGutters // 2) Remove horizontal padding
      sx={{
        width: "100%", // Fill entire viewport width
        height: "calc(100vh - 20px)", // Fill entire viewport height
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      {/* <SectionHeader
        title="Employees List"
        totalCount={employeesList.length}
        onRefresh={fetchEmployees}
        isRefreshing={isRefreshing}
        icon={<ListAltIcon sx={{ color: "#FFF" }} />}
        sx={{
          backgroundColor: "#00796b",
          color: "white",
          padding: 2,
          borderRadius: 1,
          fontWeight: 600,
        }}
      /> */}

      {fetchStatus === "failed" && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {fetchError}
        </Alert>
      )}

      {fetchStatus === "loading" ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : fetchStatus === "failed" ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {fetchError}
        </Alert>
      ) : (
        <DataTable
          data={employeesList}
          columns={columns}
          searchQuery={searchQuery}
          title="User List"
          onRefresh={fetchEmp}
          isRefreshing={isRefreshing}
        />
      )}

      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            padding: 2,
            minWidth: "600px",
          },
        }}
      >
        {/* 🔹 Dialog Title */}
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "1.25rem",
            bgcolor: "#00796b",
            color: "#FFF",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 2,
          }}
        >
          Edit Employee Details
          <IconButton
            aria-label="close"
            onClick={handleCloseEditDialog}
            sx={{
              color: "#FFF",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* 🔹 Dialog Content */}
        <DialogContent sx={{ p: 3 }}>
          {selectedEmployee && (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box
                component="form"
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Grid container spacing={2}>
                  {Object.keys(selectedEmployee).map((key) => {
                    if (key === "roles") {
                      return (
                        <Grid item xs={12} sm={6} key={key}>
                          <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                              name="roles"
                              value={editFormData.roles || ""}
                              onChange={handleInputChange}
                              renderValue={(selected) => selected || ""}
                              displayEmpty
                            >
                              <MenuItem value="ADMIN">ADMIN</MenuItem>
                              <MenuItem value="EMPLOYEE">EMPLOYEE</MenuItem>
                              <MenuItem value="BDM">BDM</MenuItem>
                              <MenuItem value="SUPERADMIN">SUPERADMIN</MenuItem>
                              <MenuItem value="TEAMLEAD">TEAMLEAD</MenuItem>
                              <MenuItem value="PARTNER">PARTNER</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      );
                    } else if (key === "status") {
                      return (
                        <Grid item xs={12} sm={6} key={key}>
                          <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                              name="status"
                              value={editFormData.status || "INACTIVE"}
                              onChange={handleInputChange}
                              label="Status"
                            >
                              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      );
                    } else if (key === "gender") {
                      return (
                        <Grid item xs={12} sm={6} key={key}>
                          <FormControl fullWidth>
                            <InputLabel>Gender</InputLabel>
                            <Select
                              name="gender"
                              value={editFormData.gender || ""}
                              onChange={handleInputChange}
                              label="Gender"
                            >
                              <MenuItem value="Male">Male</MenuItem>
                              <MenuItem value="Female">Female</MenuItem>
                              <MenuItem value="Other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      );
                    } else if (key === "joiningDate" || key === "dob") {
                      return (
                        <Grid item xs={12} sm={6} key={key}>
                          <TextField
                            label={
                              key === "joiningDate"
                                ? "Joining Date"
                                : "Date of Birth"
                            }
                            name={key}
                            type="date"
                            value={editFormData[key] || ""}
                            onChange={handleInputChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }} // Ensures label stays above input
                          />
                        </Grid>
                      );
                    } else if (key === "employeeId" || key === "email") {
                      return (
                        <Grid item xs={12} sm={6} key={key}>
                          <TextField
                            label={
                              key === "employeeId"
                                ? "Employee ID"
                                : "Employee Email"
                            }
                            value={editFormData[key] || ""}
                            disabled
                            fullWidth
                            margin="dense"
                            sx={{ bgcolor: "#f0f0f0", borderRadius: 1 }}
                          />
                        </Grid>
                      );
                    } else {
                      return (
                        <Grid item xs={12} sm={6} key={key}>
                          <TextField
                            label={key.replace(/([A-Z])/g, " $1").trim()}
                            name={key}
                            value={editFormData[key] || ""}
                            onChange={handleInputChange}
                            error={!!formErrors[key]}
                            helperText={formErrors[key]}
                            fullWidth
                            margin="dense"
                            sx={{ bgcolor: "#FFF", borderRadius: 1 }}
                          />
                        </Grid>
                      );
                    }
                  })}
                </Grid>
              </Box>
            </Paper>
          )}
        </DialogContent>

        {/* 🔹 Dialog Actions */}
        <DialogActions sx={{ justifyContent: "flex-end", p: 2 }}>
          <Button
            onClick={handleCloseEditDialog}
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{
              borderColor: "primary",
              color: "primary",
              "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" },
            }}
          >
            Discard Changes
          </Button>

          <Button
            onClick={handleSubmitEdit}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              backgroundColor: "primary",
              color: "#FFF",
              "&:hover": { backgroundColor: "primary" },
              ml: 2,
            }}
          >
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this employee?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UsersList;
