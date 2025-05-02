const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Follow a user
router.post('/:id/follow', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const targetId = req.params.id;

  if (userId === targetId) {
    return res.status(400).json({ message: "You can't follow yourself" });
  }

  const user = await User.findById(userId);
  const target = await User.findById(targetId);

  if (!target) return res.status(404).json({ message: "User not found" });

  if (!user.following.includes(targetId)) {
    user.following.push(targetId);
    target.followers.push(userId);
    await user.save();
    await target.save();
    res.status(200).json({ message: 'Followed successfully' });
  } else {
    res.status(400).json({ message: 'Already following' });
  }
});

// Unfollow a user
router.post('/:id/unfollow', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const targetId = req.params.id;

  const user = await User.findById(userId);
  const target = await User.findById(targetId);

  if (!target) return res.status(404).json({ message: "User not found" });

  user.following = user.following.filter((id) => id.toString() !== targetId);
  target.followers = target.followers.filter((id) => id.toString() !== userId);

  await user.save();
  await target.save();

  res.status(200).json({ message: 'Unfollowed successfully' });
});

// Get list of following
router.get('/:id/following', authMiddleware, async (req, res) => {
  const user = await User.findById(req.params.id).populate('following', 'username profilePicture');
  res.json(user.following);
});
