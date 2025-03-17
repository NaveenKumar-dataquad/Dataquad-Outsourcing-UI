import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  Popover,
  Divider,
  TextField,
  InputAdornment
} from "@mui/material";
import FirstPageRoundedIcon from "@mui/icons-material/FirstPageRounded";
import LastPageRoundedIcon from "@mui/icons-material/LastPageRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import SectionHeader from "./SectionHeader"; // Import the SectionHeader component
import CircularProgress from '@mui/material/CircularProgress';

const DataTable = ({ 
  data: initialData, 
  columns, 
  pageLimit = 20, 
  title = "section header", 
  onRefresh, 
  isRefreshing = false
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageLimit);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");

  const handleRefresh = () => {
    // If onRefresh is provided as a prop, call it
    if (onRefresh && typeof onRefresh === 'function') {
      onRefresh();
    }

    // Reset search and filters
    setSearchQuery("");
    setFilters({});
    setPage(0);
  };

  // State for column filters
  const [filters, setFilters] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const [uniqueValues, setUniqueValues] = useState({});

  // Initialize unique values for each column for dropdown filters
  useEffect(() => {
    const uniqueValuesMap = {};

    columns.forEach((column) => {
      if (column.type === "select") {
        const values = new Set();
        initialData.forEach((row) => {
          if (row[column.key] !== undefined && row[column.key] !== null) {
            values.add(String(row[column.key]));
          }
        });
        uniqueValuesMap[column.key] = Array.from(values).sort();
      }
    });

    setUniqueValues(uniqueValuesMap);
  }, [initialData, columns]);

  // Apply all filters and search
  useEffect(() => {
    let result = [...initialData];

    // Apply search query
    if (searchQuery) {
      result = result.filter((row) =>
        Object.keys(row).some((key) => {
          const value = row[key];
          return (
            value !== null &&
            value !== undefined &&
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
          );
        })
      );
    }

    // Apply column filters
    Object.keys(filters).forEach((key) => {
      const filterValue = filters[key];
      if (
        filterValue !== undefined &&
        filterValue !== null &&
        filterValue !== ""
      ) {
        result = result.filter((row) => {
          const cellValue = row[key];
          if (cellValue === null || cellValue === undefined) return false;

          // Handle different filter types
          const column = columns.find((col) => col.key === key);
          if (column && column.type === "select") {
            return String(cellValue) === filterValue;
          } else {
            return String(cellValue)
              .toLowerCase()
              .includes(filterValue.toLowerCase());
          }
        });
      }
    });

    setFilteredData(result);
    setPage(0);
  }, [searchQuery, filters, initialData, columns]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDialogOpen = (content) => {
    setDialogContent(content);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogContent("");
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterClick = (event, column) => {
    setFilterAnchorEl(event.currentTarget);
    setActiveFilterColumn(column);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
    setActiveFilterColumn(null);
  };

  const handleFilterChange = (column, value) => {
    setFilters((prev) => ({
      ...prev,
      [column.key]: value,
    }));
  };

  const handleClearFilter = (columnKey) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
  };

  const handleClearAllFilters = () => {
    setFilters({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).length;
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim() || !text) return text;

    const parts = String(text).split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
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

  // Render filter popover content based on column type
  const renderFilterContent = (column) => {
    if (!column || !column.type) return null; // Only apply filter if column has a type

    if (column.type === "select") {
      const filteredValues = uniqueValues[column.key]
        ? uniqueValues[column.key].filter((value) =>
            value.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

      return (
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filter by {column.label}
          </Typography>
          <FormControl fullWidth variant="outlined" size="small" sx={{ mt: 1 }}>
            <Select
              value={filters[column.key] || ""}
              onChange={(e) => handleFilterChange(column, e.target.value)}
              displayEmpty
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 250,
                    overflowY: "auto",
                    padding: 1,
                  },
                },
              }}
              renderValue={(selected) => (selected ? selected : <em>All</em>)}
            >
              {/* Search Field inside Dropdown */}
              <Box sx={{ p: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Box>

              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {filteredValues.length > 0 ? (
                filteredValues.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No results found</MenuItem>
              )}
            </Select>
          </FormControl>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button
              size="small"
              startIcon={<FilterAltOffIcon />}
              onClick={() => {
                handleClearFilter(column.key);
                setSearchTerm(""); // Reset search input
              }}
              disabled={!filters[column.key]}
            >
              Clear
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleFilterClose}
              sx={{ bgcolor: "#00796b", "&:hover": { bgcolor: "#00695c" } }}
            >
              Apply
            </Button>
          </Box>
        </Box>
      );
    }

    if (column.type === "text") {
      return (
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filter by {column.label}
          </Typography>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder={`Search ${column.label}...`}
            value={filters[column.key] || ""}
            onChange={(e) => handleFilterChange(column, e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: filters[column.key] ? (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleClearFilter(column.key)}
                    sx={{
                      transition: "transform 0.3s ease",
                      "&:hover": { transform: "scale(1.1)" },
                    }}
                  >
                    <CloseIcon fontSize="small" color="action" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              size="small"
              variant="contained"
              onClick={handleFilterClose}
              sx={{
                bgcolor: "#00796b",
                color: "white",
                textTransform: "none",
                borderRadius: 2,
                "&:hover": { bgcolor: "#00695c" },
              }}
            >
              Apply Filter
            </Button>
          </Box>
        </Box>
      );
    }

    return null; // If column type is not defined, do not render any filter
  };

  return (
    <Box
      sx={{
        width: "100%",       
        height: "calc(100vh - 1vh)", 
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Section Header with Search Field */}
      <SectionHeader
        title={title}
        totalCount={filteredData.length}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
      />
  
      {/* Show Loader Spinner if Refreshing */}
      {isRefreshing ? (
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Filters and Table */}
          <Grid container spacing={2} sx={{ mb: 1 }}>
            {getActiveFilterCount() > 0 && (
              <Grid item xs="auto" sx={{ display: "flex", alignItems: "center" }}>
                <Chip
                  icon={<FilterListIcon />}
                  label={`${getActiveFilterCount()} active filter${
                    getActiveFilterCount() > 1 ? "s" : ""
                  }`}
                  onDelete={handleClearAllFilters}
                  deleteIcon={<ClearAllIcon />}
                  sx={{
                    bgcolor: "#e0f2f1",
                    color: "#00796b",
                    "& .MuiChip-deleteIcon": {
                      color: "#e57373",
                      "&:hover": { color: "#f44336" },
                    },
                  }}
                />
              </Grid>
            )}
          </Grid>
  
          <Paper
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              border: "1px solid #ccc",
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
              mt: 1.3
            }}
          >
            <TableContainer
              sx={{
                flexGrow: 1,
                height: 500, // Fixed height to ensure pagination is visible
                overflow: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px",
                  height: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#888",
                  borderRadius: "4px",
                },
                "& .MuiTableCell-root": {
                  borderBottom: "1px solid #ccc",
                  borderRight: "1px solid #ccc",
                },
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((column, index) => (
                      <TableCell
                        key={column.key}
                        sx={{
                          backgroundColor: "#00796b",
                          color: "#fff",
                          fontWeight: "bold",
                          textAlign: "center",
                          padding: 2,
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          maxWidth: "130px",
                          overflow: "hidden",
                          // Fixed border styling - consistent across all header cells
                          borderRight: index === columns.length - 1 ? "none" : "1px solid rgba(255, 255, 255, 0.2)",
                          "&:last-child": {
                            borderRight: "none",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {column.label}
  
                          {/* Show filter icon only if column has a type */}
                          {column.type && (
                            <Tooltip title={`Filter ${column.label}`}>
                              <IconButton
                                size="small"
                                onClick={(e) => handleFilterClick(e, column)}
                                sx={{
                                  ml: 1,
                                  color: filters[column.key]
                                    ? "#F6C90E"
                                    : "inherit",
                                }}
                              >
                                {filters[column.key] ? (
                                  <FilterAltIcon fontSize="small" />
                                ) : (
                                  <FilterListIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
  
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        <Box sx={{ py: 3 }}>
                          <Typography variant="body1" sx={{ color: "#777" }}>
                            No records found
                          </Typography>
                          {(searchQuery || getActiveFilterCount() > 0) && (
                            <Button
                              variant="text"
                              startIcon={<ClearAllIcon />}
                              onClick={() => {
                                setSearchQuery("");
                                setFilters({});
                              }}
                              sx={{ mt: 2, color: "#00796b" }}
                            >
                              Clear all filters
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          sx={{
                            backgroundColor:
                              rowIndex % 2 === 0
                                ? "#f9f9f9"
                                : "rgba(192, 238, 211, 0.34)",
                            "&:hover": {
                              backgroundColor: "rgba(0, 121, 107, 0.04)",
                            },
                          }}
                        >
                          {columns.map((column, colIndex) => {
                            if (column.render) {
                              return (
                                <TableCell
                                  key={column.key}
                                  sx={{
                                    padding: 2,
                                    textAlign: "left",
                                    borderRight: colIndex === columns.length - 1 ? "none" : "1px solid #ccc",
                                  }}
                                >
                                  {column.render(row)}
                                </TableCell>
                              );
                            }
  
                            const cellData = row[column.key];
  
                            return (
                              <TableCell
                                key={column.key}
                                sx={{
                                  padding: 2,
                                  textAlign: "left",
                                  whiteSpace: "nowrap",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  borderRight: colIndex === columns.length - 1 ? "none" : "1px solid #ccc",
                                }}
                              >
                                {cellData && String(cellData).length > 15 ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {highlightText(
                                        String(cellData).slice(0, 15),
                                        searchQuery
                                      )}
                                      ...
                                    </Typography>
                                    {/* <Tooltip title="View full content">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDialogOpen(cellData)}
                                        sx={{
                                          color: "#00796b",
                                          p: 0.5,
                                        }}
                                      >
                                        <VisibilityIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip> */}
                                  </Box>
                                ) : (
                                  highlightText(cellData, searchQuery)
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 30, 40, 50]}
              sx={{
                borderTop: "1px solid #ccc",
                backgroundColor: "#fff",
              }}
              slotProps={{
                select: {
                  "aria-label": "Rows per page",
                },
                actions: {
                  showFirstButton: true,
                  showLastButton: true,
                  slots: {
                    firstPageIcon: FirstPageRoundedIcon,
                    lastPageIcon: LastPageRoundedIcon,
                    nextPageIcon: ChevronRightRoundedIcon,
                    backPageIcon: ChevronLeftRoundedIcon,
                  },
                },
              }}
            />
          </Paper>
        </>
      )}
  
      {/* Column Filter Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            borderRadius: 2,
            mt: 0.5,
          },
        }}
      >
        {renderFilterContent(activeFilterColumn)}
      </Popover>
  
      {/* Full Content Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0px 6px 24px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
          },
        }}
      >
        {/* Dialog Title with Close Icon */}
        <DialogTitle
          sx={{
            backgroundColor: "#004d40",
            color: "#fff",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {"Full Content"}
          <IconButton
            onClick={handleDialogClose}
            sx={{ color: "#fff" }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
  
        {/* Dialog Content */}
        <DialogContent dividers sx={{ padding: "16px" }}>
          <Typography
            variant="body1"
            sx={{
              fontFamily: "Roboto, sans-serif",
              color: "#333",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {highlightText(dialogContent, searchQuery)}
          </Typography>
        </DialogContent>
  
        {/* Dialog Actions */}
        <DialogActions sx={{ padding: "12px 16px", justifyContent: "end" }}>
          <Button
            onClick={handleDialogClose}
            variant="contained"
            sx={{
              backgroundColor: "#004d40",
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: "none",
              fontSize: "0.95rem",
              "&:hover": { backgroundColor: "#00695c" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataTable;