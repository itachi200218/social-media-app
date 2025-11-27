const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');  // Import the User model to get usernames
const authMiddleware = require('../middleware/auth');

// Send a message
router.post('/', authMiddleware, async (req, res) => {
  const { receiverId, content } = req.body;

  // Debugging to ensure req.user is correctly populated
  console.log('Authenticated user:', req.user); // Ensure req.user contains user data

  if (!req.user) {
    return res.status(400).json({ error: 'Sender (user) not authenticated' });
  }

  // Ensure the receiverId and content are provided in the body
  if (!receiverId || !content) {
    return res.status(400).json({ error: 'Receiver ID and message content are required' });
  }

  // Create the new message
  const newMessage = new Message({
    sender: req.user._id,  // Use req.user._id
    receiver: receiverId,   // Receiver from request body
    content,               // Content from request body
  });

  try {
    const savedMessage = await newMessage.save();
    console.log('Saved message:', savedMessage);  // Log to confirm the message is saved
    res.json(savedMessage);  // Send back the saved message
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: `Error saving message: ${err.message}` });
  }
});

// Get all messages with a specific user (for chat page)
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    // Fetch messages between the authenticated user and the specified user
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .populate('sender receiver', 'username');  // Populate sender and receiver with their username

    // Find the other user's data to show at the top of the chat
    const otherUserId = req.params.userId;
    const otherUser = await User.findById(otherUserId, 'username'); // Fetch the username of the other user

    res.json({
      messages,      // Send the messages
      otherUser,     // Send the other user's info (username)
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});
router.delete('/clear', authMiddleware, async (req, res) => {
  const userId = req.user._id;  // Get the authenticated user's ID from req.user

  try {
    // Log to confirm the correct user ID is being used
    console.log('Authenticated user ID:', userId);

    // Delete all messages where the authenticated user is either the sender or receiver
    const result = await Message.deleteMany({
      $or: [
        { sender: userId },   // Messages where the authenticated user is the sender
        { receiver: userId }   // Messages where the authenticated user is the receiver
      ]
    });

    // Log to confirm the number of messages deleted
    console.log('Messages deleted:', result.deletedCount);

    // Check if any messages were deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No messages found to delete' });
    }

    // Respond with success message
    res.status(200).json({ message: 'All messages cleared successfully' });
  } catch (err) {
    // Log the error for debugging
    console.error('Error clearing messages:', err);

    // Respond with an internal server error status
    res.status(500).json({ error: 'Server error clearing messages' });
  }
});

// Delete a specific message
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only allow the sender to delete their own message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to delete this message' });
    }

    await message.deleteOne();

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Server error deleting message' });
  }
});

module.exports = router;
