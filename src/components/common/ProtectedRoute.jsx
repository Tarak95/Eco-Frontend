import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getToken } from '../../utils/storage';
import Loader from './Loader';

// adminOnly: only users whose role (confirmed by the server) is "admin".
// The real protection is on the backend (every admin API checks the role); this just hides pages.
export const ProtectedRoute = ({ children, adminOnly = false, requireAdmin = false }) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  const needsAdmin = adminOnly || requireAdmin;

  // wait for the server to confirm the role before showing an admin page
  if (loading && needsAdmin) return <Loader text="Checking access..." />;

  if (!user || !getToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (needsAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
