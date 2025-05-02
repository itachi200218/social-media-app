import React, { useState, useEffect } from 'react';
import './Userprofile.css';
import axios from 'axios';

const Userprofile = () => {
  const [userData, setUserData] = useState({
    profilePicture: '/default-profile.png', // Default profile picture
    username: '',
    bio: '',
  });
  const [newProfilePicture, setNewProfilePicture] = useState(null); // To hold the new image if uploaded

  const token = localStorage.getItem('token'); // Token for Authorization header

  // Load profile data when the component mounts
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUserData(res.data); // Set the user profile data from the backend
      })
      .catch((err) => {
        console.error('Failed to fetch profile:', err);
      });
  }, [token]);

  // Handle the profile image change
  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfilePicture(file); // Set the selected file to be uploaded
        setUserData((prevData) => ({
          ...prevData,
          profilePicture: reader.result, // Preview the new image
        }));
      };
      reader.readAsDataURL(file); // Read the image as base64 string for preview
    }
  };
  const handleSaveChanges = async () => {
    const formData = new FormData();
  
    if (newProfilePicture) {
      formData.append('profilePicture', newProfilePicture); // Append the new profile picture
    }
  
    formData.append('username', userData.username);
    formData.append('bio', userData.bio);
  
    try {
      // Send PUT request to update profile
      await axios.put('http://localhost:5000/api/users/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Profile updated successfully!');
  
      // Fetch the updated profile data after saving the changes
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Update the user data state with the new profile information
      setUserData(res.data);
  
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };
  
  return (
    <div className="user-profile">
      <div className="profile-box">
        <img
          src={userData.profilePicture}
          alt="Profile"
          className="profile-pic"
        />
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
