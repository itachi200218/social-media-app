import React, { useState, useEffect, useRef } from 'react';
import './GeminiChatPage.css';
import { API_BASE_URL } from '../utils/config';

// Send message to Gemini API
const sendMessageToGemini = async (message, userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing');
    }
    console.log('Sending token:', token);  // Log token being sent

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, userId }),
    });

    const data = await response.json();
    if (response.ok) {
      return data.response || '';
    } else {
      throw new Error(data.response || 'Unknown error');
    }
  } catch (error) {
    console.error('Error communicating with Gemini:', error);
    return "Sorry, there was an error communicating with Gemini.";
  }
};

// Fetch chat history
const fetchChatHistory = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const response = await fetch(`${API_BASE_URL}/api/chat/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    const formattedMessages = data.history.map(entry => ({
      sender: entry.role === 'user' ? 'user' : 'chiku',
      text: entry.message,
      isCode: entry.message.startsWith("```") && entry.message.endsWith("```"),
    }));

    return formattedMessages;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
};

const GeminiChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    const loadChat = async () => {
      const history = await fetchChatHistory();
      setMessages(history);
    };
    loadChat();
  }, []);

  // Handle sending message
  const handleSendMessage = async () => {
    if (userInput.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'user', text: userInput },
      ]);
      const inputToSend = userInput;
      setUserInput('');
      setLoading(true);

      try {
        const geminiResponse = await sendMessageToGemini(inputToSend);

        if (!geminiResponse) {
          throw new Error('No response from Gemini');
        }

        const isCode = geminiResponse.startsWith("```") && geminiResponse.endsWith("```");

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: 'chiku',
            text: geminiResponse,
            isCode,
          },
        ]);
      } catch (error) {
        console.error('Error:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'chiku', text: "Sorry, there was an error communicating with Gemini." },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle Enter key
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="gemini-chat-page">
      <h2>Chiku AI</h2>
      <div className="chatbox">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className={`message-bubble ${msg.isCode ? 'code-block' : ''}`}>
                {msg.isCode ? (
                  <pre className="code-box">{msg.text.replace(/```/g, '')}</pre>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message chiku">
              <div className="spinner-wrapper">
                <div className="spinner" />
                <div className="typing">Chiku is typing...</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message"
            autoFocus
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default GeminiChatPage;

