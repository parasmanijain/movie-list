import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const isDev = (process.env.NODE_ENV).toLowerCase().includes('development');
  return isDev ? <Outlet /> : <Navigate to="/" />;
};
