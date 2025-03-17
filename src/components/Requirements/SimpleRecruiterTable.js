import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
} from "@mui/material";

const SimpleRecruiterTable = ({ tabValue, recruiters, formatHeaderText }) => {
  const theme = useTheme();

  return (
    <Box
      role="tabpanel"
      hidden={tabValue !== 3}
      id="job-details-tabpanel-3"
      aria-labelledby="job-details-tab-3"
      width='50%'
    >
      {tabValue === 3 && (
        <>
          {Array.isArray(recruiters) && recruiters.length > 0 ? (
            <TableContainer
              component={Paper}
              elevation={2}
              sx={{
                borderRadius: 1,
                overflow: "auto", // Simple scrollbar
                maxHeight: "60vh",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.primary.light }}>
                    {Object.keys(recruiters[0]).map((key) => (
                      <TableCell
                        key={key}
                        sx={{
                          fontWeight: "bold",
                          color: theme.palette.primary.contrastText,
                          py: 1.5,
                        }}
                      >
                        {formatHeaderText(key)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recruiters.map((recruiter, index) => (
                    <TableRow
                      key={recruiter.recruiterId || index}
                      sx={{
                        "&:nth-of-type(odd)": {
                          bgcolor: theme.palette.action.hover,
                        },
                        "&:hover": {
                          bgcolor: theme.palette.action.selected,
                        },
                      }}
                    >
                      {Object.entries(recruiter).map(([key, value]) => (
                        <TableCell
                          key={key}
                          sx={{
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            py: 1.5,
                          }}
                        >
                          {value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
                bgcolor: "background.paper",
                borderRadius: 1,
                border: `1px dashed ${theme.palette.divider}`,
              }}
            >
              <Typography color="textSecondary">No recruiters found</Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default SimpleRecruiterTable;
