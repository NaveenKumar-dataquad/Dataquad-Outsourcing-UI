import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../config";





// Async thunk for posting job requirements
export const postJobRequirement = createAsyncThunk(
  "jobForm/postJobRequirement",
  async (formData, { rejectWithValue }) => {
    try {
      // Check if a file is included
      const hasFile = formData.has("jobDescriptionFile");

      const response = await axios.post(
        `${BASE_URL}/requirements/assignJob`,
        formData,
        {
          headers: {
            "Content-Type": hasFile ? "multipart/form-data" : "application/x-www-form-urlencoded",
            "versioninfo": "1.0", // Add required version header
            "Accept": "application/json",
          },
        }
      );

      console.log("Job posting log:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to post job requirement"
      );
    }
  }
);



// Initial state with dynamic fields for job posting
const initialState = {
  formData: {
    jobTitle: "",
    clientName: "",
    jobDescription: "",
    jobType: "",
    location: "",
    jobMode: "",
    experienceRequired: "",
    noticePeriod: "",
    relevantExperience: "",
    qualification: "",
    recruiterIds: [],
    status: "In Progress",
    recruiterName: [],
    salaryPackage: "", // Added new field
    noOfPositions: "", // Added new field
  },
  status: "idle",
  error: null,
  jobPostingSuccessResponse: null,
};

// Slice for managing job form state
const jobFormSlice = createSlice({
  name: "jobForm",
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { name, value } = action.payload;
      if (name === "recruiterIds") {
        state.formData[name] = typeof value === "string" ? value.split(",") : value;
      } else if (name === "salaryPackage" || name === "noOfPositions") {
        // Ensure these fields only accept numbers
        state.formData[name] = value === "" ? "" : Number(value);
      } else {
        state.formData[name] = value;
      }
    },
    reduxResetForm: (state) => {
      state.formData = { ...initialState.formData };
      state.status = "idle";
      state.error = null;
      state.jobPostingSuccessResponse = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.jobPostingSuccessResponse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postJobRequirement.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.jobPostingSuccessResponse = null;
      })
      .addCase(postJobRequirement.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.jobPostingSuccessResponse = action.payload;
        state.formData = { ...initialState.formData };
      })
      .addCase(postJobRequirement.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.jobPostingSuccessResponse = null;
      });
  },
});

// Exporting actions and reducer
export const { updateField, reduxResetForm, clearMessages } = jobFormSlice.actions;
export default jobFormSlice.reducer;