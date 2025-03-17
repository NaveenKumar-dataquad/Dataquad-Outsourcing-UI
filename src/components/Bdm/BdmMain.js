import React, { useState } from "react";
import Clients from "./Clients";
import ClientForm from "./ClientForm";
import { Container, Box, Tabs, Tab } from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BusinessIcon from "@mui/icons-material/Business";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";

const BdmMain = () => {
  const [value, setValue] = useState(0); // 0: Clients, 1: Form
  const [toastMessage, setToastMessage] = useState(null); // Stores toast message

  const handleChange = (event, newValue) => {
    setValue(newValue);

    // Show toast when switching back to Clients tab
    if (newValue === 0 && toastMessage) {
      toast.success(toastMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reset message after showing
      setToastMessage(null);
    }
  };

  return (
    <Container
      maxWidth="xxl"
      sx={{
        minHeight: "calc(100vh - 74px)",
        display: "flex",
        flexDirection: "column",
        py: 2,
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="client tabs"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          width: "60%",
          bgcolor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          ".MuiTabs-indicator": {
            height: "4px",
            borderRadius: "4px",
            backgroundColor: "#2A4DBD",
          },
        }}
      >
        <Tab
          icon={<BusinessIcon fontSize="small" />}
          iconPosition="start"
          label="Clients"
          id="client-tab-0"
          aria-controls="client-tabpanel-0"
          sx={{
            fontSize: "0.9rem",
            fontWeight: 600,
            textTransform: "none",
            color: "#0F1C46",
            borderRadius: "8px",
            px: 3,
            "&:hover": { bgcolor: "#f0f4ff" },
            "&.Mui-selected": { color: "#2A4DBD" },
          }}
        />
        <Tab
          icon={<AddBusinessIcon fontSize="small" />}
          iconPosition="start"
          label="Onboard New Client"
          id="client-tab-1"
          aria-controls="client-tabpanel-1"
          sx={{
            fontSize: "0.9rem",
            fontWeight: 600,
            textTransform: "none",
            color: "#0F1C46",
            borderRadius: "8px",
            px: 3,
            "&:hover": { bgcolor: "#f0f4ff" },
            "&.Mui-selected": { color: "#2A4DBD" },
          }}
        />
      </Tabs>

      {/* Content Section */}
      <Box
        sx={{
          flex: 1,
          borderRadius: 2,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          bgcolor: "#fff",
        }}
      >
        {value === 0 ? <Clients setToastMessage={setToastMessage} /> : <ClientForm setToastMessage={setToastMessage} />}
      </Box>
    </Container>
  );
};

export default BdmMain;
