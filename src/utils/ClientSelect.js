import React, { useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClients } from "../redux/features/clientSlice";
import { useField } from "formik";
import {
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Box,
  InputLabel,
  FormControl,
  FormHelperText,
  useTheme,
  Divider,
} from "@mui/material";

const ClientSelect = ({ name, label = "Select Client", ...props }) => {
  const dispatch = useDispatch();
  const { clientsList, isLoading, error } = useSelector((state) => state.clients);
  const fetchCalled = useRef(false);
  const theme = useTheme();

  // Formik hook
  const [field, meta, helpers] = useField(name);

  // Fetch clients only once
  useEffect(() => {
    if (!fetchCalled.current) {
      dispatch(fetchClients());
      fetchCalled.current = true;
    }
  }, [dispatch]);

  // Sort clients alphabetically
  const sortedClients = useMemo(() => {
    return clientsList ? [...clientsList].sort((a, b) => a.clientName.localeCompare(b.clientName)) : [];
  }, [clientsList]);

  // Generate menu items
  const menuItems = useMemo(() => {
    return sortedClients.flatMap((client) => [
      <MenuItem
        key={client.id}
        value={client.clientName}
        sx={{
          fontWeight: 600,
          padding: "10px 16px",
          "&:hover": { backgroundColor: theme.palette.action.hover },
          transition: "all 0.2s ease-in-out",
        }}
      >
        {client.clientName}
      </MenuItem>,

      // Supporting customers (children)
      ...(client.supportingCustomers || []).map((supportingCustomer, index) => (
        <MenuItem
          key={`${client.id}-supporting-${index}`}
          value={`${client.clientName} - ${supportingCustomer}`}
          sx={{
            padding: "8px 16px",
            pl: 4, // Indentation for child elements
            fontSize: "0.875rem",
            color: theme.palette.text.secondary,
            backgroundColor: theme.palette.action.selected,
            "&:hover": { backgroundColor: theme.palette.action.hover },
            transition: "all 0.2s ease-in-out",
          }}
        >
          {supportingCustomer}
        </MenuItem>
      )),
      
      <Divider key={`divider-${client.id}`} sx={{ my: 0.5 }} />,
    ]);
  }, [sortedClients, theme]);

  return (
    <FormControl fullWidth error={meta.touched && Boolean(meta.error)} {...props}>
      <InputLabel>{label}</InputLabel>
      <Select
        {...field}
        label={label}
        displayEmpty
        renderValue={(selected) => selected || <em>{label}</em>}
        disabled={isLoading || !!error}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: "40vh",
              overflowY: "auto",
              borderRadius: 2,
              boxShadow: theme.shadows[3],
              p: 1,
            },
          },
        }}
        onChange={(e) => {
          helpers.setValue(e.target.value);
          helpers.setTouched(true);
        }}
      >
        {/* Loading State */}
        {isLoading ? (
          <MenuItem disabled>
            <Box display="flex" alignItems="center">
              <CircularProgress size={18} sx={{ mr: 1 }} />
              <Typography variant="body2">Loading clients...</Typography>
            </Box>
          </MenuItem>
        ) : error ? (
          <MenuItem disabled>
            <Typography variant="body2" color="error">
              Failed to load clients
            </Typography>
          </MenuItem>
        ) : sortedClients.length === 0 ? (
          <MenuItem disabled>No clients found</MenuItem>
        ) : (
          menuItems
        )}
      </Select>
      {meta.touched && meta.error && <FormHelperText>{meta.error}</FormHelperText>}
    </FormControl>
  );
};

export default ClientSelect;
