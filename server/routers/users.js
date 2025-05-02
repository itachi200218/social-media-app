const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// Create 'uploads/' directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the created uploads directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Save file with timestamp to avoid name conflicts
  },
});

const upload = multer({ storage });

// Serve the uploaded files
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// GET user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      username: user.username,
      bio: user.bio,
      profilePicture: user.profilePicture, // Assuming profilePicture is a field in your User model
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update user profile (with file upload for profile picture)
router.put('/profile', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    const { username, bio } = req.body;
    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const updatedData = {
      username,
      bio,
    };

    // If a new profile picture is uploaded, include it in the update
    if (req.file) {
      updatedData.profilePicture = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    // Update the user in the database
    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
