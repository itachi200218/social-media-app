const mongoose = require('mongoose');

// Define User schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensure the username is unique
  },

  password: {
    type: String,
    required: true, // Password is required for authentication
  },

  bio: {
    type: String,
    default: '', // Default to empty string if no bio is provided
  },

  profilePicture: {
    type: String,
    default: '/default-profile.png', // Default to a placeholder image
  },

  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to other users
    },
  ],

  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],

}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Create and export User model based on UserSchema
const User = mongoose.model('User', UserSchema);

module.exports = User;
