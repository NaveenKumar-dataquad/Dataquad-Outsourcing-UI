import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  styled,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import VerifiedIcon from "@mui/icons-material/Verified";
import axios from "axios";
import BASE_URL from "../../redux/config";


// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: theme.shape.borderRadius * 2,
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(2),
    },
  },
}));

const StyledOtpInput = styled(TextField)(({ theme }) => ({
  width: "52px",
  margin: theme.spacing(0, 0.5),
  "& .MuiInputBase-root": {
    height: "52px",
  },
  "& input": {
    textAlign: "center",
    fontSize: "1.5rem",
    padding: theme.spacing(1),
    fontWeight: "bold",
    caretColor: theme.palette.primary.main,
  },
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
    },
  },
}));

const EmailVerificationDialog = ({
  open,
  onClose,
  email,
  onVerificationSuccess,
}) => {
  const theme = useTheme();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (open && email) {
      handleSendOtp();
    }
  }, [open, email]);

  useEffect(() => {
    if (timeLeft > 0 && open) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, open]);

  const handleSendOtp = async () => {
    if (!email || email.trim() === "") {
      setError("Email cannot be empty.");
      return;
    }
  
    setIsSending(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/users/sendOtp?email=${encodeURIComponent(email)}`,
        {}, 
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        setTimeLeft(300);
        setError("");
        setSuccessMessage(response.data.message || "OTP sent successfully!"); 
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error("Error details:", err.response?.data || err);
  
      // Extract error message safely
      const errorMessage = err.response?.data?.message 
          || err.response?.data?.error
          || err.message
          || "Failed to send OTP. Please try again.";
  
      setError(errorMessage);
  }
   finally {
      setIsSending(false);
    }
  };
  

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete OTP.");
      return;
    }
  
    setIsVerifying(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/users/verifyOtp`,
        { email, otp: otpString },
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.data.success) {
        setError(""); // Clear any previous error message
        setSuccessMessage("OTP verified successfully!"); // Set success message
  
        setTimeout(() => {
          onVerificationSuccess();
          onClose();
          setSuccessMessage(""); // Clear success message after closing
        }, 2000);
      } else {
        // Handle API error message properly
        throw new Error(response.data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("Verification Error:", err.response?.data || err);
  
      if (err.response?.data?.message) {
        setError(err.response.data.message); // Display API error message
      } else {
        setError("Invalid OTP. Please try again."); // Fallback error
      }
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleClose = () => {
    setOtp(["", "", "", "", "", ""]); // Clear OTP input
    setError(""); // Clear error messages
    setSuccessMessage(""); // Clear success message
    setTimeLeft(300); // Reset timer
    onClose(); // Call the parent onClose function
  };
  

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 3,
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight="600">
          Verify Your Email
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      {successMessage && (
        <Alert severity="success" sx={{ my: 2 }}>
          {successMessage}
        </Alert>
      )}

      <DialogContent>
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            We've sent a verification code to:
          </Typography>
          <Typography
            variant="body1"
            fontWeight="600"
            color="primary"
            sx={{ mt: 0.5 }}
          >
            {email}
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                my: 2,
                "& .MuiAlert-message": {
                  width: "100%",
                  textAlign: "left",
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            sx={{
              my: 4,
              display: "flex",
              justifyContent: "center",
              gap: 1,
            }}
          >
            {otp.map((digit, index) => (
              <StyledOtpInput
                key={index}
                name={`otp-${index}`}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                inputProps={{ maxLength: 1 }}
                autoFocus={index === 0}
              />
            ))}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Time remaining:{" "}
              <Typography
                component="span"
                fontWeight="600"
                color="error"
                sx={{ ml: 0.5 }}
              >
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </Typography>
            </Typography>

            <Button
              variant="outlined"
              onClick={handleSendOtp}
              disabled={timeLeft > 0 || isSending}
              startIcon={
                isSending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AutorenewIcon />
                )
              }
              sx={{
                minWidth: 120,
                "&.Mui-disabled": {
                  borderColor: theme.palette.action.disabledBackground,
                },
              }}
            >
              {isSending ? "Sending..." : "Resend OTP"}
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          pt: 2,
          justifyContent: "center",
          gap: 1,
        }}
      >
        <Button variant="outlined" onClick={handleClose} sx={{ minWidth: 100 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleVerifyOtp}
          disabled={otp.join("").length !== 6 || isVerifying}
          startIcon={
            isVerifying ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <VerifiedIcon />
            )
          }
          sx={{
            minWidth: 100,
            "&.Mui-disabled": {
              backgroundColor: theme.palette.action.disabledBackground,
            },
          }}
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default EmailVerificationDialog;



