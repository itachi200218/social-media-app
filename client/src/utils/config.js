export const API_BASE_URL = 
  process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000'  // For local development
    : 'https://social-media-app-sd36.onrender.com';  // For production
