import React, { useState } from "react";
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
} from "@mui/material";
import FirstPageRoundedIcon from "@mui/icons-material/FirstPageRounded";
import LastPageRoundedIcon from "@mui/icons-material/LastPageRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import VisibilityIcon from "@mui/icons-material/Visibility";

const DataTable = ({ data, columns, pageLimit = 5, searchQuery = "" }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageLimit);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState("");

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

  const shouldShowBottomHeader = data.length > 20;

  const highlightText = (text, highlight) => {
    if (!highlight.trim() || !text) return text;
    
    const parts = String(text).split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} style={{ backgroundColor: '#fff3cd', padding: '0.1rem' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <>
      <TableContainer
        component={Paper}
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#00796b" }}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    border: "1px solid #ccc",
                    textAlign: "center",
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No records
                </TableCell>
              </TableRow>
            ) : (
              data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => {
                      // Check if column has a render function
                      if (column.render) {
                        return (
                          <TableCell
                            key={column.key}
                            style={{
                              border: "1px solid #ccc",
                              padding: "8px",
                              textAlign: "center",
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
                          style={{
                            border: "1px solid #ccc",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          {cellData && String(cellData).length > 20 ? (
                            <>
                              {highlightText(String(cellData).slice(0, 15), searchQuery)}...
                              <Button
                                variant="text"
                                color="primary"
                                onClick={() => handleDialogOpen(cellData)}
                                style={{
                                  marginLeft: "0.25rem",
                                  textTransform: "none",
                                  padding: "0.125rem 0.25rem",
                                  borderRadius: "0.2rem",
                                  fontWeight: "500",
                                  fontSize: "0.6875rem",
                                  minWidth: "auto",
                                }}
                                sx={{
                                  "&:hover": {
                                    backgroundColor: "lightgray",
                                  },
                                  "&:focus": {
                                    outline: "none",
                                    borderColor: "lightgray",
                                  },
                                }}
                              >
                                <Typography
                                  variant="button"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: "0.6875rem",
                                  }}
                                >
                                  <VisibilityIcon
                                    sx={{
                                      marginRight: "0.125rem",
                                      fontSize: "0.875rem",
                                    }}
                                  />
                                  See More
                                </Typography>
                              </Button>
                            </>
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

          {shouldShowBottomHeader && (
            <TableHead>
              <TableRow style={{ backgroundColor: "#00796b" }}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      border: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}
        </Table>
        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
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
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Full Content</DialogTitle>
        <DialogContent dividers>
          <div
            style={{
              fontFamily: "Roboto, sans-serif",
              fontSize: "16px",
              color: "#333",
            }}
          >
            {highlightText(dialogContent, searchQuery)}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogClose}
            color="primary"
            variant="contained"
            size="large"
            style={{ textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DataTable;