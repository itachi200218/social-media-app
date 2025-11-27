// src/components/FollowButton.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

const FollowButton = ({ targetUserId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/users/${currentUserId}/following`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const ids = res.data.map((u) => u._id);
        setIsFollowing(ids.includes(targetUserId));
      })
      .catch((err) => console.error(err));
  }, [targetUserId, currentUserId, token]);

  const follow = async () => {
    await axios.post(`${API_BASE_URL}/api/users/${targetUserId}/follow`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setIsFollowing(true);
  };

  const unfollow = async () => {
    await axios.post(`${API_BASE_URL}/api/users/${targetUserId}/unfollow`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setIsFollowing(false);
  };

  if (currentUserId === targetUserId) return null; // Don't show for self

  return isFollowing ? (
    <button onClick={unfollow}>Unfollow</button>
  ) : (
    <button onClick={follow}>Follow</button>
  );
};

export default FollowButton;
