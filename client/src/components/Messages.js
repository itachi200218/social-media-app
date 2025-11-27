import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Messages = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      const currentUser = JSON.parse(atob(token.split('.')[1])).__id;
      const otherUsers = res.data.filter(user => user._id !== currentUser);
      setUsers(otherUsers);
    })
    .catch(err => console.error(err));
  }, [token]);

  const handleChat = (userId) => {
    navigate(`/messages/${userId}`); // Ensure this matches your route
  };

  return (
    <div className="messages-container">
      <h2>Messages</h2>
      <ul className="user-list">
        {users.map(user => (
          <li key={user._id} onClick={() => handleChat(user._id)} className="user-item">
            <strong>{user.username}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Messages;
