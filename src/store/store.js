import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/authSlice';
import employeesReducer from '../redux/employeesSlice'; // Import the employees reducer
import clientsReducer from '../redux/clientsSlice';
import benchReducer from '../redux/benchSlice'
import requirementReducer from '../redux/requirementSlice'
import interviewReducer from '../redux/interviewSlice'
import submissionReducer from '../redux/submissionSlice'
import commonReducer from '../redux/commonSlice'
import placementReducer from "../redux/placementSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeesReducer, // Add the employees reducer to the store
    clients: clientsReducer,
    bench: benchReducer,
    requirement: requirementReducer,
    interview: interviewReducer,
    submission: submissionReducer,
    common: commonReducer,
    placement:placementReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;