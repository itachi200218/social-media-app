const express = require('express');
const Post = require('../models/Post');
const authenticateToken = require('../middleware/auth'); // Import the JWT authentication middleware
const router = express.Router();

// GET /api/posts - Fetch all posts (secured with token authentication)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Fetch all posts and populate the userId with the username
    const posts = await Post.find()
      .populate('userId', 'username') // Only get the 'username' from userId
      .exec();

    res.status(200).json(posts); // Send the posts as a JSON response
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});




// POST /api/posts - Create a new post (secured with token authentication)
router.post('/', authenticateToken, async (req, res) => {
  const { content, imageUrl } = req.body;
  const userId = req.user._id; // Ensure this comes from the JWT token

  if (!content) {
    return res.status(400).json({ message: 'Content is required.' });
  }

  if (!userId) {
    return res.status(400).json({ message: 'User not authenticated.' });
  }

  try {
    // Create a new post object
    const newPost = new Post({
      content,
      image: imageUrl,  // Optional image URL
      userId: userId,   // Associate post with the authenticated user
    });

    // Save the post to the database
    await newPost.save();

    // Respond with the newly created post
    res.status(201).json(newPost);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Error creating post, please try again.' });
  }
});

// DELETE /api/posts/:id - Delete a post (secured with token authentication)
// Delete a single post by ID
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params; // Get the post ID from the URL
  const userId = req.user._id; // Get the user ID from the JWT token

  try {
    // Check if the post exists and if it belongs to the authenticated user
    const post = await Post.findOne({ _id: id, userId: userId });

    if (!post) {
      return res.status(404).json({ message: 'Post not found or not authorized to delete.' });
    }

    // Delete the post
    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Error deleting post, please try again.' });
  }
});

module.exports = router;  // Export the router for use in your server.js
