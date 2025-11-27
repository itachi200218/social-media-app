import React, { useState, useEffect } from 'react';
import './Userprofile.css';
import axios from 'axios';
import { API_BASE_URL } from '../utils/config'; // 👈 import the base URL

const Userprofile = () => {
  const [userData, setUserData] = useState({
    profilePicture: '/default-profile.png',
    username: '',
    bio: '',
  });
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUserData(res.data))
      .catch((err) => console.error('Failed to fetch profile:', err));
  }, [token]);

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfilePicture(file);
        setUserData((prevData) => ({
          ...prevData,
          profilePicture: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    const formData = new FormData();
    if (newProfilePicture) {
      formData.append('profilePicture', newProfilePicture);
    }
    formData.append('username', userData.username);
    formData.append('bio', userData.bio);

    try {
      await axios.put(`${API_BASE_URL}/api/users/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Profile updated successfully!');

      const res = await axios.get(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div className="user-profile">
      <div className="profile-box">
        <img src={userData.profilePicture} alt="Profile" className="profile-pic" />
        <div className="upload-container">
          <label htmlFor="profile-image-upload" className="upload-button">
            Upload New Picture
          </label>
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            style={{ display: 'none' }}
          />
        </div>

        <div className="edit-info">
          <label>Username:</label>
          <input
            type="text"
            value={userData.username}
            onChange={(e) =>
              setUserData({ ...userData, username: e.target.value })
            }
            className="input-field"
          />
        </div>

        <div className="edit-info">
          <label>Bio:</label>
          <textarea
            value={userData.bio}
            onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
            className="input-field"
          />
        </div>

        <div className="save-button-container">
          <button onClick={handleSaveChanges} className="save-button">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Userprofile;
