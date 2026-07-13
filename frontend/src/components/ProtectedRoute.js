import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  // 1. Not logged in
  if (!user) {
    alert("Access Denied: Please log in to view this page.");
    return <Navigate to="/" replace />;
  }

  // 2. Check for intersection between user.roles array and allowedRoles array
  const hasPermission = user.roles.some(role => allowedRoles.includes(role));

  if (!hasPermission) {
    alert("Access Denied: You do not have the required permissions.");
    return <Navigate to="/" replace />;
  }

  // 3. They have at least one valid role, let them pass!
  return <Outlet />;
};

export default ProtectedRoute;