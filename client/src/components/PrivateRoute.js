// components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem('token'); // Check if token exists

  if (!token) {
    return <Navigate to="/login" />; // Redirect to login if not authenticated
  }

  return element; // If authenticated, render the element (the component passed to the route)
};

export default PrivateRoute;
