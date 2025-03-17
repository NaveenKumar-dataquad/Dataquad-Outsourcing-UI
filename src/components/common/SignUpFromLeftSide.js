import { Box, Typography, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import React from "react";
import logo from "../../assets/Mulyafinalnew-Copy.svg";

const SignUpFromLeftSide = () => {
  const theme = useTheme();

  return (
    <Grid container style={{ height: "100vh" }}>
      <Grid
        item
        xs={12}
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(246, 245, 245, 0.8)",
          flexDirection: "column",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
       
        <Box sx={{ mb: 2, maxWidth: "80%", width: "auto" }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              maxWidth: "100%",
              height: "auto",
              objectFit: "contain", // Ensures logo fits well
              width: "80%", // Default width for larger devices
              "@media (max-width:600px)": {
                width: "30%", // Smaller width on mobile devices
              },
              "@media (max-width:900px)": {
                width: "70%", // Medium width on tablets
              },
            }}
          />
        </Box>

       
      </Grid>
    </Grid>
  );
};

export default SignUpFromLeftSide;
