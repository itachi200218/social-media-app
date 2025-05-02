// src/components/Followers.js
import React, { useState, useEffect } from 'react';

const Followers = () => {
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    // Mock followers data
    const mockFollowers = [
      { _id: 1, username: 'Alice', profilePicture: '/default-profile.png' },
      { _id: 2, username: 'Bob', profilePicture: '/default-profile.png' },
    ];
    setFollowers(mockFollowers);
  }, []);

  return (
    <div className="followers">
      <h2>Followers ({followers.length})</h2>
      <ul>
        {followers.map((f) => (
          <li key={f._id}>
            <img src={f.profilePicture || '/default-profile.png'} alt={f.username} className="small-avatar" />
            {f.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Followers;
