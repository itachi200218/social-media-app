import React from 'react';
import ReactDOM from 'react-dom/client';  // Import from 'react-dom/client'
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
const root = ReactDOM.createRoot(document.getElementById('root'));  // Create a root using createRoot
root.render(  // Use render on the created root
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
