import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import { API_BASE_URL } from '../utils/config'; // ✅ using config URL from utils folder

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ Send credentials to login API
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });

      const { token, user } = response.data; // ✅ Assuming backend sends `user` and `token`

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); // ✅ Store the full user object

      toast.success('Login successful!');
      navigate('/feed');
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials and try again.');
      toast.error('Login failed. Please check your credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Username:</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label>Password:</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p>
          Don’t have an account?{' '}
          <span onClick={() => navigate('/register')} className="register-link">
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;

