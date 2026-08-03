// Amir
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, requiresVerification = false }) => {
  // 1. Grab the loading state from context
  const { user, loading } = useAuth(); 

  // 2. If the app is still fetching the session, show a temporary loading screen
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#6B7280' }}>
        Verifying session...
      </div>
    );
  }

  // 3. Not logged in (Proceeds only after loading is false)
  if (!user) {
    alert("Access Denied: Please log in to view this page.");
    return <Navigate to="/login" replace />;
  }

  // Catches singular 'role', plural 'roles', and legacy strings
  const rawRole = user.role || user.roles || [];
  const userRoles = Array.isArray(rawRole) ? rawRole : [rawRole];

  // 2. Check for intersection between userRoles array and allowedRoles array
  const hasPermission = userRoles.some(role => allowedRoles.includes(role));

  if (!hasPermission) {
    alert("Access Denied: You do not have the required permissions.");
    return <Navigate to="/" replace />;
  }

  // --- VERIFICATION CHECK ---
  // If the route requires verification, and the user is anything but 'Verified', block them.
  if (requiresVerification && user.verificationStatus !== 'Verified') {
    const statusText = user.verificationStatus || 'Pending';
    alert(`Access Denied: Your account status is currently '${statusText}'. You must be Verified to access this feature.`);
    
    // Kick them to the Dashboard so they can see their status or upload documents
    return <Navigate to="/dashboard" replace />;
  }

  // 3. They have at least one valid role, let them pass!
  return <Outlet />;
};

export default ProtectedRoute;