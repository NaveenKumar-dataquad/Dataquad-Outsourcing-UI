import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Divider
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack, Email, VpnKey, LockReset } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../redux/config";

const API_ENDPOINTS = {
  SEND_OTP: `${BASE_URL}/users/send-otp`,
  VERIFY_OTP: `${BASE_URL}/users/verify-otp`,
  RESET_PASSWORD: `${BASE_URL}/users/update-password`,
};

const steps = [
  {
    label: 'Verify Email',
    description: 'Enter your email address to receive an OTP',
    icon: <Email color="primary" />
  },
  {
    label: 'Enter OTP',
    description: 'Enter the 6-digit code sent to your email',
    icon: <VpnKey color="primary" />
  },
  {
    label: 'Reset Password',
    description: 'Create a new secure password',
    icon: <LockReset color="primary" />
  },
];

const ForgotPasswordMain = ({showSignIn}) => {
  const navigate = useNavigate();

  // State management
  const [email, setEmail] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Validation functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) => {
    const errors = {};
    if (password.length < 8) errors.password = "At least 8 characters required";
    if (!/\d/.test(password)) errors.password = "Include at least one number";
    if (!/[A-Z]/.test(password)) errors.password = "Include one uppercase letter";
    if (!/[!@#$%^&*]/.test(password)) errors.password = "Include one special character";
    return errors;
  };

  // Handle email submission
  const handleSubmitEmail = async (e) => {
    e.preventDefault();
  
    // Validate email before submitting
    if (!validateEmail(email)) {
      setValidationErrors({ email: "Please enter a valid email address" });
      return;
    }
  
    // Reset previous errors & success messages
    setValidationErrors({});
    setError("");
    setSuccess("");
  
    try {
      setLoading(true);
  
      const response = await axios.post(API_ENDPOINTS.SEND_OTP, { email });
  
      if (!response.data.success) {
        // If API returns success: false, show the error message
        setError(response.data.message || "User not found.");
        return;
      }
  
      // Success case: OTP sent
      setSuccess("OTP sent successfully! Please check your email.");
      setActiveStep(1);
    } catch (err) {
      // Handle API or network errors
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  
  

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.length !== 6) {
      setValidationErrors({ otp: "Please enter a valid 6-digit OTP" });
      return;
    }
    setValidationErrors({});
    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.VERIFY_OTP, { email, otp: enteredOtp });
      if (response.data.success) {
        setSuccess("OTP verified successfully!");
        setActiveStep(2);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errors = validatePassword(password);
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.RESET_PASSWORD, { email, updatePassword: password, confirmPassword });
      if (response.data.success) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => goToSignIn(), 3000);
      } else {
        setError("Error resetting password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setEmail("");
    setEnteredOtp("");
    setPassword("");
    setConfirmPassword("");
  };

  const goToSignIn = () => {
   showSignIn()
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        maxHeight: "100vh",
        bgcolor: "#FFF",
        p: 2
      }}
    >
      <Card
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 2,
          overflow: "visible",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid #eaedf3" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <IconButton 
              onClick={goToSignIn}
              size="small"
              sx={{ mr: 1 }}
            >
              <ArrowBack fontSize="small" />
            </IconButton>
            <Typography variant="h5" fontWeight={700} color="#2A4DBD">
              Reset Password
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Follow the steps below to reset your password
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {(error || success) && (
            <Alert 
              severity={error ? "error" : "success"} 
              sx={{ mb: 3, borderRadius: 1 }}
            >
              {error || success}
            </Alert>
          )}

          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel StepIconComponent={() => step.icon}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {step.description}
                  </Typography>
                  
                  {index === 0 && (
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={!!validationErrors.email}
                      helperText={validationErrors.email}
                      placeholder="yourname@example.com"
                      sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5
                        }
                      }}
                    />
                  )}

                  {index === 1 && (
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="OTP Code"
                      placeholder="Enter 6-digit code"
                      type="text"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      error={!!validationErrors.otp}
                      helperText={validationErrors.otp}
                      sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5
                        }
                      }}
                      inputProps={{ maxLength: 6 }}
                    />
                  )}

                  {index === 2 && (
                    <>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!validationErrors.password}
                        helperText={validationErrors.password}
                        sx={{ 
                          mb: 3,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={!!validationErrors.confirmPassword}
                        helperText={validationErrors.confirmPassword}
                        sx={{ 
                          mb: 3,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </>
                  )}

                  <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={
                        index === 0
                          ? handleSubmitEmail
                          : index === 1
                          ? handleVerifyOtp
                          : handleResetPassword
                      }
                      sx={{
                        py: 1,
                        backgroundColor: "#2A4DBD",
                        fontWeight: 600,
                        borderRadius: 1.5,
                        textTransform: "none",
                        boxShadow: "0 4px 12px rgba(42, 77, 189, 0.2)",
                        '&:hover': {
                          backgroundColor: "#1a3aa8",
                        }
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : index === steps.length - 1 ? (
                        "Reset Password"
                      ) : (
                        "Continue"
                      )}
                    </Button>

                    {index > 0 && (
                      <Button
                        onClick={handleBack}
                        variant="outlined"
                        sx={{
                          py: 1,
                          borderColor: "#2A4DBD",
                          color: "#2A4DBD",
                          borderRadius: 1.5,
                          textTransform: "none",
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: "#1a3aa8",
                            backgroundColor: "rgba(42, 77, 189, 0.04)"
                          }
                        }}
                      >
                        Back
                      </Button>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          
          {activeStep === steps.length && (
            <Paper square elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "#f0f5ff" }}>
              <Typography sx={{ mb: 2 }}>
                Password reset successfully! You can now sign in with your new password.
              </Typography>
              <Button
                onClick={goToSignIn}
                variant="contained"
                sx={{
                  py: 1,
                  backgroundColor: "#2A4DBD",
                  fontWeight: 600,
                  borderRadius: 1.5,
                  textTransform: "none"
                }}
              >
                Go to Sign In
              </Button>
            </Paper>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default ForgotPasswordMain;