// components/ProtectedRoute.jsx
import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [], allowedUserTypes = [] }) {
  const { isAuthenticated, getUserRole, isHouseOwner, isStaff } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check user type restrictions
  if (allowedUserTypes.length > 0) {
    if (isHouseOwner() && !allowedUserTypes.includes('houseowner')) {
      return <Navigate to="/unauthorized" replace />;
    }
    if (isStaff() && !allowedUserTypes.includes('user')) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check role restrictions (for staff users only)
  if (allowedRoles.length > 0 && isStaff()) {
    const userRole = getUserRole();
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}