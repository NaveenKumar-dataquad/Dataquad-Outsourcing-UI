import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../config";



export const submitFormData = createAsyncThunk(
  "form/submit",
  async (formData, { rejectWithValue }) => {
    try {
      console.log("Sending form data:", formData);
      const response = await axios.post(
        `${BASE_URL}/users/register`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("API Response:", response.data); // Log the response data
      return response.data;
    } catch (error) {
      console.error("Error submitting form:", error.response);

      const errorCode = error.response?.data?.error?.errorcode;
      const errorMessage =
        error.response?.data?.error?.errormessage || "Error submitting form";

      // Check for specific error code or default to a general error
      if (errorCode === "300") {
        return rejectWithValue(errorMessage);
      } else {
        return rejectWithValue("An unknown error occurred");
      }
    }
  }
);

// Initial state
const initialState = {
  status: null,
  error: {
    userId: null,
    userName: null,
    password: null,
    confirmPassword: null,
    email: null,
    personalemail: null,
    phoneNumber: null,
    designation: null,
    gender: null,
    joiningDate: null,
    dob: null,
    roles: null,
    general: null, // General error field
  },
  response: null,
  formData: {
    userId: "",
    userName: "",
    password: "",
    confirmPassword: "",
    email: "",
    personalemail: "",
    phoneNumber: "",
    designation: "",
    gender: "",
    joiningDate: null,
    dob: null,
    roles: ["EMPLOYEE"],
  },
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    // Update form data
    updateFormData: (state, action) => {
      const { name, value } = action.payload;
      state.formData[name] = value;
    },

    // Clear form data and reset errors
    clearFormData: (state) => {
      state.formData = {
        userId: "",
        userName: "",
        password: "",
        confirmPassword: "",
        email: "",
        personalemail: "",
        phoneNumber: "",
        designation: "",
        gender: "",
        joiningDate: null,
        dob: null,
        roles: ["EMPLOYEE"],
      };
      state.status = null;
      state.error = {
        userId: null,
        userName: null,
        password: null,
        confirmPassword: null,
        email: null,
        personalemail: null,
        phoneNumber: null,
        designation: null,
        gender: null,
        joiningDate: null,
        dob: null,
        roles: null,
        general: null,
      };
      state.response = null;
    },

    // Clear success response and error response
    clearResponse: (state) => {
      state.response = null;
      state.error = {
        userId: null,
        userName: null,
        password: null,
        confirmPassword: null,
        email: null,
        personalemail: null,
        phoneNumber: null,
        designation: null,
        gender: null,
        joiningDate: null,
        dob: null,
        roles: null,
        general: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitFormData.pending, (state) => {
        state.status = "loading";

        // Reset all errors on new submission attempt
        Object.keys(state.error).forEach((key) => {
          state.error[key] = null;
        });
      })
      .addCase(submitFormData.fulfilled, (state, action) => {
        const { success, message, data, error } = action.payload;
        console.log(action.payload);

        if (success) {
          state.status = "succeeded";
          state.response = {
            message,
            data,
          };
        } else {
          state.status = "failed";
          state.error.general = error || "An unknown error occurred.";
        }

        console.log("Success Response:", action.payload);
      })
      .addCase(submitFormData.rejected, (state, action) => {
        state.status = "failed";

        // Reset all error fields
        Object.keys(state.error).forEach((key) => {
          state.error[key] = null;
        });

        if (action.payload) {
          // Map specific error messages to fields
          if (action.payload.includes("userId already exists")) {
            state.error.userId =
              "User ID already exists. Please choose a different one.";
          }
          if (action.payload.includes("email is already in use")) {
            state.error.email = "Email is already in use. Please try another.";
          }
          // General error fallback
          if (!state.error.userId && !state.error.email) {
            state.error.general = action.payload;
            console.log("general state ", action.payload);
          }
        } else {
          state.error.general =
            "An unknown error occurred. Please try again later.";
        }
      });
  },
});

export const { updateFormData, clearFormData, clearResponse } =
  formSlice.actions;

export default formSlice.reducer;
