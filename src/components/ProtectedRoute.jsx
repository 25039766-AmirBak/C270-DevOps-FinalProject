import { Navigate } from 'react-router-dom';

function ProtectedRoute({ element: protectedElement }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return protectedElement;
}

export default ProtectedRoute;
