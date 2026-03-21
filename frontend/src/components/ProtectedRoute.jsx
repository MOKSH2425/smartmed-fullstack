import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, authReady } = useAuth();

  useEffect(() => {
    if (authReady && !isAuthenticated) {
      toast.error("Please login to access this page.");
    }
  }, [authReady, isAuthenticated]);

  if (!authReady) {
    return (
      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: '2rem', maxWidth: '420px' }}>
          <h3 style={{ marginTop: 0 }}>Checking your session...</h3>
          <p style={{ marginBottom: 0, opacity: 0.8 }}>We are validating your account access.</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
