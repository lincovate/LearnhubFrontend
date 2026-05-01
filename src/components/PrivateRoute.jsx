import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './PrivateRoute.css';

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, getProfileType } = useAuth();

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole) {
    const profileType = getProfileType();
    if (profileType !== requiredRole) {
      return <Navigate to={`/${profileType}/dashboard`} />;
    }
  }

  return <div className="private-route">{children}</div>;
};

export default PrivateRoute;