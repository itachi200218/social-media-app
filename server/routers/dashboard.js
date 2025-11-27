const express = require('express');
const auth = require('../middleware/auth'); // Ensure the path is correct
const router = express.Router();

// Example protected route
router.get('/dashboard', auth, (req, res) => {
  res.json({ message: 'Welcome to your dashboard', user: req.user });
});

module.exports = router;