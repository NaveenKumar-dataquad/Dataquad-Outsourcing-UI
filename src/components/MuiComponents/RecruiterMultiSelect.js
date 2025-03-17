import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  CircularProgress,
  FormHelperText,
  Grid,
  Box,
  Typography,
  Chip,
  Avatar,
  Divider,
  OutlinedInput,
  useTheme
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { fetchEmployees } from "../../redux/features/employeesSlice";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const RecruiterMultiSelect = ({ values, setFieldValue, errors, touched }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  // Get employees data from Redux store
  const { employeesList, fetchStatus } = useSelector((state) => state.employees);

  // Filter active employees with EMPLOYEE role
  const recruiters = employeesList.filter(
    (emp) => (emp.roles === "EMPLOYEE" || emp.roles === "TEAMLEAD") && emp.status === "ACTIVE"
  );
  

  // Filter recruiters based on search term
  const filteredRecruiters = recruiters.filter(emp => 
    emp.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch employees on component mount
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleChange = (event) => {
    const selectedValues = event.target.value || [];

    const selectedIds = selectedValues
      .map((name) => {
        const employee = recruiters.find((emp) => emp.userName === name);
        return employee ? employee.employeeId : null;
      })
      .filter((id) => id !== null);

    setFieldValue("recruiterName", selectedValues);
    setFieldValue("recruiterIds", selectedIds);
  };

  const handleDelete = (recruiterToDelete) => (event) => {
    // Stop event propagation to prevent the select from opening
    event.preventDefault();
    event.stopPropagation();
    
    const updatedValues = values.recruiterName.filter(
      (recruiter) => recruiter !== recruiterToDelete
    );
    
    const updatedIds = updatedValues
      .map((name) => {
        const employee = recruiters.find((emp) => emp.userName === name);
        return employee ? employee.employeeId : null;
      })
      .filter((id) => id !== null);
    
    setFieldValue("recruiterName", updatedValues);
    setFieldValue("recruiterIds", updatedIds);
  };

  return (
    <Grid item xs={12} md={8}>
      <FormControl 
        fullWidth 
        error={touched.recruiterName && Boolean(errors.recruiterName)}
        sx={{ 
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
            },
          }
        }}
      >
        <InputLabel id="recruiter-select-label" sx={{ backgroundColor: 'transparent' }}>
          Select Recruiters
        </InputLabel>
        <Select
          labelId="recruiter-select-label"
          multiple
          value={Array.isArray(values.recruiterName) ? values.recruiterName : []}
          onChange={handleChange}
          input={<OutlinedInput label="Select Recruiters" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip
                  key={value}
                  label={value}
                  avatar={<Avatar><PersonIcon /></Avatar>}
                  onDelete={handleDelete(value)}
                  deleteIcon={
                    <ClearIcon 
                      fontSize="small"
                      onMouseDown={(event) => event.stopPropagation()}
                    />
                  }
                  sx={{ 
                    borderRadius: '16px',
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    '& .MuiChip-deleteIcon': {
                      color: theme.palette.primary.contrastText,
                      '&:hover': { color: theme.palette.error.light }
                    }
                  }}
                />
              ))}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 350,
              },
            },
          }}
        >
          {/* Search Input */}
          <MenuItem 
            dense 
            disableTouchRipple 
            disableRipple 
            sx={{ 
              position: 'sticky', 
              top: 0, 
              backgroundColor: 'white', 
              zIndex: 1, 
              p: 1 
            }}
          >
            <OutlinedInput
              size="small"
              fullWidth
              placeholder="Search recruiters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              }
              sx={{ 
                '& .MuiOutlinedInput-notchedOutline': { 
                  borderColor: theme.palette.divider 
                }
              }}
            />
          </MenuItem>
          
          <Divider />

          {/* Loading State */}
          {fetchStatus === "loading" ? (
            <MenuItem disabled sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography>Loading recruiters...</Typography>
            </MenuItem>
          ) : filteredRecruiters.length > 0 ? (
            filteredRecruiters.map((emp) => (
              <MenuItem 
                key={emp.employeeId} 
                value={emp.userName}
                sx={{ 
                  borderRadius: '4px', 
                  m: 0.5,
                  '&:hover': { 
                    backgroundColor: theme.palette.action.hover 
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.lighter,
                    '&:hover': { 
                      backgroundColor: theme.palette.primary.light 
                    }
                  }
                }}
              >
                <Checkbox 
                  checked={values.recruiterName.includes(emp.userName)} 
                  sx={{ 
                    color: theme.palette.primary.main,
                    '&.Mui-checked': {
                      color: theme.palette.primary.main,
                    }
                  }}
                />
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          mr: 1, 
                          bgcolor: theme.palette.primary.main 
                        }}
                      >
                        {emp.userName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body1">{emp.userName}</Typography>
                    </Box>
                  } 
                />
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Typography color="text.secondary">No matching recruiters found</Typography>
            </MenuItem>
          )}
        </Select>

        {touched.recruiterName && errors.recruiterName && (
          <FormHelperText sx={{ color: theme.palette.error.main }}>
            {errors.recruiterName}
          </FormHelperText>
        )}
      </FormControl>
    </Grid>
  );
};

export default RecruiterMultiSelect;