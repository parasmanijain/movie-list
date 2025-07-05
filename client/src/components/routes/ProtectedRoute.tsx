import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const [environment] = useState(import.meta.env.NODE_ENV || 'development'); // Default to 'development'
  const isDev = environment?.toLowerCase().includes('development');
  return isDev ? <Outlet /> : <Navigate to="/" />;
};
