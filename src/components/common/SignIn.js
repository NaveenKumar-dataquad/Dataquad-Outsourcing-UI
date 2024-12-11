// src/components/SignIn.js
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginAsync } from "../../redux/features/authSlice";
import {
  Container,
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "../ForgotPassword";

const SignIn = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, status, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false); 

  const handleSubmit = (event) => {
    event.preventDefault();
    // Dispatch the loginAsync action with email and password
    dispatch(loginAsync({ email, password }))
      .then((action) => {
        const roles = action.payload.roles;

        console.log("user roles : ======", roles);

        // Navigate based on the user's role
        if (roles.includes("ADMIN")) {
          navigate("/Admin");
        } else if (roles.includes("EMPLOYEE")) {
          navigate("/Employee");
        } else if (roles.includes("SUPERADMIN")) {
          navigate("/SuperAdmin");
        } else {
          // Default route if no role matches
          navigate("/");
        }
      })
      .catch((error) => {
        // Handle login error
        console.log("Login failed:", error);
      });
  };

    // Function to go back to the SignIn form from ForgotPassword
    const goBackToSignIn = () => {
      setShowForgotPassword(false); // Toggle the state to show SignIn form again
    };

  return (
    (
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            {showForgotPassword ? "" : "Sign In"}
          </Typography>
  
          {/* Show error message */}
          {error && <Alert severity="error">{error}</Alert>}
  
          {/* Conditional rendering based on the state */}
          {showForgotPassword ? (
            <ForgotPassword goBack={goBackToSignIn} /> // Pass the goBackToSignIn function to ForgotPassword component
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              {/* Email Field */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
  
              {/* Password Field */}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
  
              {/* Submit Button */}
              <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
                {/* Forgot Password Link */}
                <Link
                  href="#"
                  variant="body2"
                  sx={{ mt: 2 }}
                  onClick={() => setShowForgotPassword(true)} // Show ForgotPassword when clicked
                >
                  Forgot Password?
                </Link>
  
                <Button
                  type="submit"
                  md={1}
                  variant="contained"
                  sx={{ mt: 3, mb: 2, ml: 22 }}
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Box>
  
              {/* Optionally show authentication success or error */}
              {isAuthenticated && (
                <Typography color="green">Login successful!</Typography>
              )}
            </Box>
          )}
        </Box>
      </Container>
    )
  );
};

export default SignIn;
