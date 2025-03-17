import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../config";





// Fetch employees thunk
export const fetchEmployees = createAsyncThunk(
  "employee/fetchEmployees",
  async () => {
    const response = await axios.get(`${BASE_URL}/users/employee`);
    return response.data;
  }
);

// Update employee thunk
export const updateEmployee = createAsyncThunk(
  "employee/updateEmployee",
  async (employeeData) => {
    // Store employeeId in a separate variable for the path variable
    const { employeeId, ...updatedData } = employeeData;

    console.log("employee data from the edit  ", updatedData); // Log the updated data without employeeId

    // Now send the request with the updated data (without employeeId) and use employeeId in the URL path
    const response = await axios.put(
      `${BASE_URL}/users/update/${employeeId}`, // Use employeeId in the URL path
      updatedData, // Send the updated data (without employeeId)
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }
);

// Delete employee thunk
export const deleteEmployee = createAsyncThunk(
  "employee/deleteEmployee",
  async (employeeId) => {
    await axios.delete(`${BASE_URL}/users/delete/${employeeId}`);
    return employeeId; // Return the ID of the deleted employee
  }
);

const employeesSlice = createSlice({
  name: "employee",
  initialState: {
    employeesList: [],
    fetchStatus: "idle",
    fetchError: null,
    updateStatus: "idle",
    updateError: null,
    deleteStatus: "idle",
    deleteError: null,
    updatedUserResponse: null,
  },
  reducers: {
    resetUpdateStatus: (state) => {
      state.updateStatus = "idle";
      state.updateError = null;
    },
    resetDeleteStatus: (state) => {
      state.deleteStatus = "idle";
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cases
      .addCase(fetchEmployees.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.employeesList = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.error.message;
      })

      // Update cases
      .addCase(updateEmployee.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.updatedUserResponse = action.payload; // Store API response
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.error.message;
      })

      // Delete cases
      .addCase(deleteEmployee.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.employeesList = state.employeesList.filter(
          (employee) => employee.id !== action.payload
        );
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.error.message;
      });
  },
});

export const { resetUpdateStatus, resetDeleteStatus } = employeesSlice.actions;
export default employeesSlice.reducer;
