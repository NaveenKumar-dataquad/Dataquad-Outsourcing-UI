import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import SignInMain from "./components/Registration/SignInMain";
import SignUpFormMain from "./components/Registration/SignUpFormMain";
import PreventNavigation from "./components/common/PreventNavigation";
import UseLogoutOnUnload from "./utils/useLogoutOnUnload";

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
        <Route path="/signup" element={<SignUpFormMain />} />
        
        {/* Protected Routes - Dashboard with all tabs */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute roles={["ADMIN", "EMPLOYEE", "SUPERADMIN", "TEAMLEAD", "BDM","PARTNER"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;