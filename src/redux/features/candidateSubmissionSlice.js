import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../config";




// Initial state
const initialState = {
  formData: {
    userId: "",
    jobId: "",
    fullName: "",
    candidateEmailId: "",
    contactNumber: "",
    currentOrganization: "",
    qualification: "",
    totalExperience: "",
    relevantExperience: "",
    currentCTC: "",
    expectedCTC: "",
    noticePeriod: "",
    currentLocation: "",
    preferredLocation: "",
    skills: "",
    resumeFile: null,
    resumeFilePath: "",
    communicationSkills: "",
    requiredTechnologiesRating: "",
    overallFeedback: "",
    userEmail: "",
  },
  loading: false,
  successResponse: null,
  errorMessage: "",
  candidateId: "",
  employeeId: "",
  jobId: "",
};

// Helper function to validate file type
const isValidFileType = (file) => {
  const validTypes = [
    "application/pdf", // PDF
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
    "application/msword", // DOC
  ];
  return file && validTypes.includes(file.type);
};

// Form submission thunk
export const submitFormData = createAsyncThunk(
  "candidateSubmission/submit",
  async ({ formData, userId, jobId, userEmail }, { rejectWithValue }) => {
    try {
      // Validate file type before submission
      if (formData.resumeFile && !isValidFileType(formData.resumeFile)) {
        return rejectWithValue("Invalid file type. Only PDF , DOC and DOCX are allowed.");
      }

      // Create FormData for file upload
      const form = new FormData();

      // Append form fields
      Object.keys(formData).forEach((key) => {
        // Skip resumeFile and resumeFilePath as they need special handling
        if (key !== "resumeFile" && key !== "resumeFilePath" && formData[key] !== null) {
          // Handle arrays (like skills)
          if (Array.isArray(formData[key])) {
            form.append(key, JSON.stringify(formData[key]));
          } else {
            form.append(key, formData[key].toString());
          }
        }
      });

      // Append file if present and valid
      if (formData.resumeFile) {
        form.append("resumeFile", formData.resumeFile);
      }
      if (formData.resumeFilePath) {
        form.append("resumeFilePath", formData.resumeFilePath);
      }

      // Make API call
      const response = await axios.post(
        `${BASE_URL}/candidate/candidatesubmissions`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        status: "Success",
        message: response.data.message,
        payload: {
          candidateId: response.data.candidateId,
          employeeId: response.data.employeeId,
          jobId: response.data.jobId,
        },
      };
    } catch (error) {
      // Handle API error response
      if (error.response?.data?.message) {
        return rejectWithValue({
          message: error.response.data.message,
          candidateId: null,
          employeeId: null,
          jobId: null,
        });
      }
      // Handle other errors
      return rejectWithValue({
        message: "Failed to submit candidate data. Please try again.",
        candidateId: null,
        employeeId: null,
        jobId: null,
      });
    }
  }
);

// Create the slice
const candidateSubmissionSlice = createSlice({
  name: "candidateSubmission",
  initialState,
  reducers: {
    updateFormData: (state, action) => {
      state.formData = {
        ...state.formData,
        ...action.payload,
      };
    },

    resetForm: (state) => {
      state.formData = { ...initialState.formData };
      state.successMessage = "";
      state.errorMessage = "";
      state.candidateId = "";
      state.employeeId = "";
      state.jobId = "";
    },

    clearMessages: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(submitFormData.pending, (state) => {
      state.loading = true;
      state.successResponse = null;
      state.errorResponse = null;
    })
    .addCase(submitFormData.fulfilled, (state, action) => {
      state.loading = false;
      state.successResponse = action.payload;
      state.formData = initialState.formData;
    })
    .addCase(submitFormData.rejected, (state, action) => {
      state.loading = false;
      state.errorResponse = action.payload;
    });
  },
});

export const { updateFormData, resetForm, clearMessages } = candidateSubmissionSlice.actions;
export default candidateSubmissionSlice.reducer;
