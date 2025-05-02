import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaPaperPlane, FaHeart, FaSun, FaMoon, FaTrashAlt, FaSpinner } from 'react-icons/fa';
import './ChatPage.css';
import { colors } from './colors';
import { API_BASE_URL } from '../utils/config';  // Importing the config file

const ChatPage = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [otherUser, setOtherUser] = useState('');
  const [bgColor, setBgColor] = useState('#f5f5f5');
  const [favColor, setFavColor] = useState(null);
  const [isCycling, setIsCycling] = useState(true);
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State to track loading
  const [clearStatus, setClearStatus] = useState(""); // State to track success/failure of clear action

  // Check if the user exists in localStorage and safely parse the user
let currentUser = null;
try {
  const userString = localStorage.getItem('user');
  currentUser = userString && userString !== "undefined" ? JSON.parse(userString) : null;
} catch (err) {
  console.error('Invalid JSON in localStorage for user:', err);
  localStorage.removeItem('user'); // Clean up corrupted data
}


  let colorIndex = 0;

  const updateBackground = () => {
    if (!favColor && isCycling && !isRandomMode) {
      setBgColor(colors[colorIndex]);
      colorIndex = (colorIndex + 1) % colors.length;
    }
  };

  useEffect(() => {
    let interval;
    if (isRandomMode) {
      interval = setInterval(() => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setBgColor(randomColor);
      }, 10000);
    } else if (!favColor && isCycling) {
      interval = setInterval(updateBackground, 5000);
    }

    return () => clearInterval(interval);
  }, [favColor, isCycling, isRandomMode]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/messages/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setMessages(res.data.messages);
        setOtherUser(res.data.otherUser.username);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [userId]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/messages`,
        { receiverId: userId, content: message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setMessages((prevMessages) => [...prevMessages, res.data]);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const deleteMessage = async (messageId) => {
    console.log('Attempting to delete message with ID:', messageId);
    try {
      if (!messageId) {
        console.error('No message ID provided');
        return;
      }
  
      // Send the DELETE request to delete the message
      const res = await axios.delete(`${API_BASE_URL}/api/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,  // Pass the token
        },
      });
  
      console.log('Server response:', res.data);
  
      // Update local state to remove the deleted message
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const clearAllMessages = async () => {
    // Ask for confirmation before proceeding with the deletion
    const isConfirmed = window.confirm("Are you sure you want to delete all messages?");
    
    if (!isConfirmed) {
      return;  // If the user doesn't confirm, do nothing and exit
    }
  
    setIsLoading(true);  // Start loading
    setClearStatus(""); // Clear any previous status message
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the token if required for authentication
        },
      });
  
      if (!response.ok) {
        throw new Error('Error clearing messages');
      }
  
      console.log('Messages cleared successfully');
      setMessages([]);  // Optionally clear the local state of messages
      setClearStatus("All messages have been cleared successfully.");
  
      // Hide the success message after 3 seconds
      setTimeout(() => {
        setClearStatus("");
      }, 3000);
    } catch (error) {
      console.error('Error clearing messages:', error);
      setClearStatus("Failed to clear messages. Please try again.");
  
      // Hide the warning message after 3 seconds
      setTimeout(() => {
        setClearStatus("");
      }, 3000);
    }
  
    setIsLoading(false);  // End loading
  };
  
  useEffect(() => {
    const chatBox = document.querySelector('.chat-box');
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, [messages]);

  const handleFavorite = (color) => {
    setFavColor(color);
    setIsCycling(false);
    setIsRandomMode(false);
    localStorage.setItem('favColor', color);
  };

  useEffect(() => {
    const savedFavColor = localStorage.getItem('favColor');
    if (savedFavColor) {
      setFavColor(savedFavColor);
      setIsCycling(false);
    }
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Adjust the format as needed
  };

  return (
    <div className="chat-page" style={{ backgroundColor: favColor || bgColor }}>
      <h3 className="chat-header">{otherUser || 'Loading...'}</h3>

      <div className="top-right-actions">
        <div className="theme-toggle-container">
          <button className="theme-toggle-button" onClick={() => setShowThemes(!showThemes)}>
            {showThemes ? <FaMoon /> : <FaSun />}
          </button>

          {showThemes && (
            <div className="theme-picker">
              <h4>Select a Theme Color</h4>
              <div className="color-picker">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    style={{ backgroundColor: color }}
                    onClick={() => handleFavorite(color)}
                    className={`color-button ${favColor === color ? 'selected' : ''}`}
                  >
                    {favColor === color ? <FaHeart /> : null}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ color: 'white' }}>Random Color Mode:</label>
                <input
                  type="checkbox"
                  checked={isRandomMode}
                  onChange={() => {
                    setIsRandomMode(!isRandomMode);
                    setFavColor(null);
                    setIsCycling(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="clear-chat-btn-container">
          <button className="clear-chat-btn" onClick={clearAllMessages}>
            {isLoading ? <FaSpinner className="spinner" /> : <FaTrashAlt />}
          </button>
        </div>
      </div>

      {clearStatus && <p>{clearStatus}</p>} {/* Display success or failure message */}

      <div className="chat-box">
        {messages.map((msg, i) => {
          const isSelf = msg.sender.username === currentUser?.username;
          return (
            <div key={i} className={`message ${isSelf ? 'message-right' : 'message-left'}`}>
              <strong>{msg.sender.username}:</strong> {msg.content}
              <span className="message-timestamp">{formatTimestamp(msg.timestamp)}</span>
              {(isSelf || currentUser?.isAdmin) && (
                <button
                  className="delete-btn"
                  onClick={() => deleteMessage(msg._id)}
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;

