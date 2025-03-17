// App.js - Updated version
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import JobForm from "./components/Requirements/JobForm";
import LeaveApplication from "./components/LeaveApplication";
import InterviewForm from "./components/InterviewForm";
import CandidateSubmissionForm from "./components/CandidateSubmissionFrom";
import AttendanceTracker from "./components/AttendanceTracker";
import AdminDashboard from "./components/AdminDashboard";
import PreventNavigation from "./components/common/PreventNavigation";
import SignUpFormMain from "./components/Registration/SignUpFormMain";
import UseLogoutOnUnload from "./utils/useLogoutOnUnload";
import SignInMain from "./components/Registration/SignInMain";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <PreventNavigation />
      <UseLogoutOnUnload />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ marginTop: "5%" }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignInMain />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["ADMIN", "EMPLOYEE", "SUPERADMIN","TEAMLEAD","BDM"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
