// ProtectedRoute.js - Updated version
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, roles: userRoles } = useSelector((state) => state.auth);

  console.log('User Roles:', userRoles);
  console.log('Required Roles:', roles);
  console.log('Is Authenticated:', isAuthenticated);

  // Convert roles to array if it's a string
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  
  // Check if the user is authenticated and has at least one of the required roles
  const hasAccess = isAuthenticated && 
    requiredRoles.some(role => userRoles.includes(role));

  return hasAccess ? children : <Navigate to="/" />;
};

export default ProtectedRoute;