import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginAsync } from "../../redux/features/authSlice";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  TextField,
  Divider,
  Grid,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { ToastContainer } from "react-toastify";
import ForgotPasswordMain from "./ForgotPasswordMain"; // Forgot Password Component
import SignUpFromLeftSide from "../common/SignUpFromLeftSide"; // Left Side Branding Component
import SignUpFormMain from "./SignUpFormMain"; // Sign Up Component
import { useNavigate } from "react-router-dom";

const SignInMain = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, status, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Toggle Forgot Password Component
  const [showSignUp, setShowSignUp] = useState(false); // Toggle Sign Up Component

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const { email, password } = credentials;
  
    dispatch(loginAsync({ email, password }))
      .then((action) => {
        const roles = action.payload.roles;
        if (roles && roles.length) {
          // Navigate based on the user's role
          if (roles.includes("SUPERADMIN")) {
            navigate("/dashboard");
          } else if (roles.includes("ADMIN")) {
            navigate("/dashboard");
          }
          else if (roles.includes("BDM")) {
            navigate("/dashboard");
          }
          else if (roles.includes("TEAMLEAD")) {  // ✅ Added TEAMLEAD Role
            navigate("/dashboard");
          } else if (roles.includes("EMPLOYEE")) {
            navigate("/dashboard");
          } else {
            // Default route if no role matches
            navigate("/");
          }
        }
      })
      .catch((error) => {
        console.log("Login failed:", error);
      });
  };
  

  return (
    <Grid container sx={{ height: "100vh" }}>
      {/* Left Side Branding (Always Present) */}
      <Grid item xs={12} md={6}>
        <SignUpFromLeftSide />
      </Grid>

      {/* Right Side - Sign In or Sign Up */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f7fa",
        }}
      >
        {showSignUp ? (
          <SignUpFormMain showSignIn={() => setShowSignUp(false)} /> 
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Card
              elevation={6}
              sx={{ p: 4, width: "100%", maxWidth: 450, borderRadius: 2 }}
            >
              {showForgotPassword ? (
                <ForgotPasswordMain
                  showSignIn={() => setShowForgotPassword(false)}
                />
              ) : (
                <>
                  <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "#2A4DBD", mb: 1 }}
                    >
                      Welcome Back
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Sign in to continue to your account
                    </Typography>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                      {error}
                    </Alert>
                  )}
                  {isAuthenticated && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 1 }}>
                      Login successful!
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      placeholder="yourname@example.com"
                      value={credentials.email}
                      onChange={handleChange}
                      autoComplete="email"
                      autoFocus
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                        mb: 3,
                      }}
                    />

                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={credentials.password}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                        mb: 2,
                      }}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        mb: 3,
                      }}
                    >
                      <Button
                        variant="text"
                        onClick={() => setShowForgotPassword(true)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 500,
                          color: "#2A4DBD",
                          textDecoration: "underline",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        Forgot Password?
                      </Button>

                      <Button
                        type="submit"
                        variant="contained"
                        disabled={status === "loading"}
                        sx={{
                          py: 1.5,
                          width: 100,
                          backgroundColor: "#2A4DBD",
                          fontWeight: 600,
                          borderRadius: 1.5,
                          textTransform: "none",
                          boxShadow: "0 4px 12px rgba(42, 77, 189, 0.2)",
                          "&:hover": {
                            backgroundColor: "#1a3aa8",
                            boxShadow: "0 6px 16px rgba(42, 77, 189, 0.3)",
                          },
                        }}
                      >
                        {status === "loading" ? (
                          <CircularProgress size={24} sx={{ color: "white" }} />
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </Box>

                    <Divider sx={{ my: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        OR
                      </Typography>
                    </Divider>

                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Don't have an account?
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => setShowSignUp(true)} // ✅ Click to Show SignUpFormMain
                        sx={{
                          py: 1.5,
                          px: 4,
                          borderColor: "#2A4DBD",
                          color: "#2A4DBD",
                          borderRadius: 1.5,
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": {
                            borderColor: "#1a3aa8",
                            backgroundColor: "rgba(42, 77, 189, 0.04)",
                          },
                        }}
                      >
                        Create Account
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </Card>
            <ToastContainer />
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default SignInMain;
