import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Core pages
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Feed from './components/Feed';
import Post from './components/Post';
import NotFound from './components/NotFound';

// Chat and messaging
import ChatPage from './components/ChatPage';
import Messages from './components/Messages';

// Profile-related
import FollowersPage from './components/Followers';
import FollowingPage from './components/Following';
import UserProfile from './components/Userprofile';  // Import UserProfile

// Other features
import FitnessAI from './components/fitness';

// Gemini Chat
import GeminiChatPage from './components/GeminiChatPage'; // Import GeminiChatPage

// Layout & route protection
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

const App = () => {
  return (
    <Routes>
      {/* Redirect base route to /login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={<PrivateRoute element={<Layout><Dashboard /></Layout>} />}
      />
      <Route
        path="/feed"
        element={<PrivateRoute element={<Layout><Feed /></Layout>} />}
      />
      <Route
        path="/post/:id"
        element={<PrivateRoute element={<Layout><Post /></Layout>} />}
      />
      <Route
        path="/chat/:userId"
        element={<PrivateRoute element={<Layout><ChatPage /></Layout>} />}
      />
      <Route
        path="/messages"
        element={<PrivateRoute element={<Layout><Messages /></Layout>} />}
      />
      <Route
        path="/messages/:userId"
        element={<PrivateRoute element={<Layout><ChatPage /></Layout>} />}
      />
      <Route
        path="/fitness-ai"
        element={<PrivateRoute element={<Layout><FitnessAI /></Layout>} />}
      />

      {/* Profile routes */}
      <Route
        path="/followers"
        element={<PrivateRoute element={<Layout><FollowersPage /></Layout>} />}
      />
      <Route
        path="/following"
        element={<PrivateRoute element={<Layout><FollowingPage /></Layout>} />}
      />
      <Route
        path="/user-profile"
        element={<PrivateRoute element={<Layout><UserProfile /></Layout>} />}
      />

      {/* New Gemini Chat route */}
      <Route
        path="/chiku-chat"
        element={<PrivateRoute element={<Layout><GeminiChatPage /></Layout>} />}
      />

      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;

