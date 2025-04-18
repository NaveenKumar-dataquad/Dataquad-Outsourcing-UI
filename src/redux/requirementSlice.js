import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import httpService from "../Services/httpService";

export const filterRequirementsByDateRange = createAsyncThunk(
    'requirements/filterByDateRange',
    async({startDate, endDate}, {rejectWithValue}) => {
        try{
       
          const response = await httpService.get(`/requirements/filterByDate?startDate=${startDate}&endDate=${endDate}`);
          
          return response.data;
        }catch(error){
          console.log(error);
          return rejectWithValue(error);
        }
       }
)

// Filter requirements for employee
export const filterRequirementsByRecruiter = createAsyncThunk(
  'recruiter/requirements/filterByDateRange',
  async({startDate, endDate}, {getState, rejectWithValue}) => {
      try{
        const state = getState();
        const recruiterId = state.auth.userId;
 
        const response = await httpService.get(`/requirements/recruiter/${recruiterId}/filterByDate?startDate=${startDate}&endDate=${endDate}`);
        
        return response.data;
      }catch(error){
        console.log(error);
        return rejectWithValue(error);
      }
     }
)


const requirementSlice =  createSlice({
    name: "requirement",
    initialState: {
        loading: false,
        filteredRequirementList: [],
        filterAssignedRequirements: [],
        isFilteredReqRequested: false,
        error: null
    },
    reducers: {
        setFilteredReqDataRequested: (state, action) => {
            state.isFilteredDataRequested = action.payload;
        }

    }, extraReducers: (builder) => {
        builder
          // Filter Requirement List By date Range
          .addCase(filterRequirementsByDateRange.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(filterRequirementsByDateRange.fulfilled, (state, action) => {
            state.loading = false;
            state.filteredRequirementList = action.payload;
          })
          .addCase(filterRequirementsByDateRange.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
            
          })

          // Filter Recruiter requirements
          .addCase(filterRequirementsByRecruiter.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(filterRequirementsByRecruiter.fulfilled, (state, action) => {
            state.loading = false;
            state.filterAssignedRequirements = action.payload;
          })
          .addCase(filterRequirementsByRecruiter.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
            
          })
        }
})

export const { setFilteredReqDataRequested } = requirementSlice.actions;
export default requirementSlice.reducer;