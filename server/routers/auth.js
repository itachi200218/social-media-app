const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// POST /register - Register a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;  // Extract username and password from the request body

  // Validate username and password
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error during registration' });
  }
});

// POST /login - Log in a user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { _id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }  // Token expiry time
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,  // Sending the token back to the client
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login error' });
  }
});

// Authentication middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token and attach user data to the request
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;  // Attach verified user data to req.user
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Example of a protected route using the authentication middleware
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Find user by ID from the JWT payload (req.user._id)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Exclude password before sending the user data
    const { password, ...userData } = user._doc;
    res.status(200).json(userData);  // Send user data excluding password
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

module.exports = router;
