// src/components/Following.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/config';
import FollowButton from './FollowButton';

const Following = () => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const fetchFollowing = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/${userId}/following`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) {
          setFollowing(res.data);
        } else {
          console.warn('Unexpected response:', res.data);
          setFollowing([]);
        }
      } catch (err) {
        console.error('Failed to fetch following:', err);
        if (err.response && err.response.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to load following list.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, []);

  return (
    <div className="following">
      <h2>Following ({following.length})</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : following.length === 0 ? (
        <p>You're not following anyone yet.</p>
      ) : (
        <ul>
          {following.map((user) => (
            <li key={user._id} className="following-item">
              <img
                src={user.profilePicture || '/default-profile.png'}
                alt={user.username}
                className="small-avatar"
              />
              <span>{user.username}</span>
              <FollowButton targetUserId={user._id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Following;
