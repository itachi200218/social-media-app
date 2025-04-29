import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import axios from 'axios'; // Import axios for API calls
import { API_BASE_URL } from '../utils/config'; // ✅ Import the backend URL

const Dashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);  // Store user data
  const [loading, setLoading] = useState(true);    // Handle loading state
  const [posts, setPosts] = useState([]);          // Store posts data
  const [notifications, setNotifications] = useState([]); // Store notifications
  const [bioInput, setBioInput] = useState('');    // Bio input for editing
  const [profilePic, setProfilePic] = useState(''); // Profile picture for editing

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId'); // Ensure userId is in localStorage

    if (!token) {
      navigate('/login');
    } else if (storedUserId) {
      setUserId(storedUserId); // Set the userId if available
      fetchUserData(storedUserId);  // Fetch user data if userId is available
      fetchPosts();  // Fetch posts
      fetchNotifications();  // Fetch notifications
    }
  }, [navigate]);

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`);  // Use API_BASE_URL for user data
      setUserData(response.data);
      setLoading(false);  // Set loading to false once data is fetched
    } catch (error) {
      console.error('Error fetching user data', error);
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/posts`);  // Use API_BASE_URL for posts
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications`);  // Use API_BASE_URL for notifications
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleProfileUpdate = async () => {
    try {
      const updatedData = { bio: bioInput, profilePicture: profilePic };
      const response = await axios.put(`${API_BASE_URL}/api/users/${userId}`, updatedData);  // Use API_BASE_URL for updating profile
      setUserData(response.data);
    } catch (error) {
      console.error('Error updating profile', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        {/* Sidebar with profile info */}
        <div className="profile-info">
          {loading ? (
            <p>Loading...</p>
          ) : (
            userData && (
              <div>
                <img src={userData.profilePicture || '/default-profile.png'} alt={userData.username} className="profile-picture" />
                <h3>{userData.username}</h3>
                <p>{userData.email}</p>
                <p>{userData.location}</p>
                <p>{userData.occupation}</p>
                <p>{userData.bio}</p>
              </div>
            )
          )}
        </div>

        {/* Profile Edit Section (always visible) */}
        <div className="profile-edit-section">
          <h3>Edit Your Profile</h3>
          <div className="edit-profile-form">
            <label>
              Bio:
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder={userData ? userData.bio : 'Write your bio here...'}
              />
            </label>
            <label>
              Profile Picture URL:
              <input
                type="text"
                value={profilePic}
                onChange={(e) => setProfilePic(e.target.value)}
                placeholder={userData ? userData.profilePicture : 'Enter image URL...'}
              />
            </label>
            <button onClick={handleProfileUpdate}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
