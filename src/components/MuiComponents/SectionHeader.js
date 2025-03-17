import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

const SectionHeader = ({
  title,
  totalCount,
  onRefresh,
  isRefreshing,
  icon = <ListAltIcon fontSize="medium" sx={{ color: "#FFF" }} />,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  searchWidth = 250,
}) => {
  return (
    <Box
      sx={{
        bgcolor: "#00796b",
        p: 2,
        borderRadius: 2,
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      {/* Title & Total Count Section */}
      <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
        {/* Dynamic Icon */}
        <Box
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.2)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ ml: 2, overflow: "hidden" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "500",
              color: "#FFF",
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#FFF",
              fontSize: "14px",
              opacity: 0.8,
              mt: 0.5,
              whiteSpace: "nowrap",
            }}
          >
            Total Records: <strong>{totalCount}</strong>
          </Typography>
        </Box>
      </Box>

      {/* Search Field */}
      <TextField
        variant="outlined"
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={onSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "rgba(0,0,0,0.54)" }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => onSearchChange({ target: { value: "" } })}
                edge="end"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          width: searchWidth,
          maxWidth: "100%",
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor: "#ffffff",
            "& fieldset": {
              borderColor: "rgba(0,0,0,0.23)",
              transition: "border-color 0.2s ease-in-out",
            },
            "&:hover fieldset": { borderColor: "#00796b" },
            "&.Mui-focused fieldset": {
              borderColor: "#00796b",
              borderWidth: 1,
            },
          },
          "& .MuiInputBase-input": {
            color: "#000",
          },
        }}
      />

      {/* Refresh Button */}
      <Tooltip title="Reload Data">
        <span> {/* Wrap in span to maintain tooltip on disabled state */}
          <IconButton
            onClick={onRefresh}
            disabled={isRefreshing}
            sx={{
              bgcolor: "#FFF",
              color: "#005f56",
              transition: "0.3s",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.04)",
                color: "#FFFFFF",
              },
              width: 44,
              height: 44,
              flexShrink: 0,
            }}
          >
            <RefreshIcon
              sx={{
                transition: "transform 0.5s",
                transform: isRefreshing ? "rotate(360deg)" : "rotate(0deg)",
                animation: isRefreshing 
                  ? "spin 1s linear infinite" 
                  : "none",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default SectionHeader;