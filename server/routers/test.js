const express = require('express');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Token is valid', user: req.user });
});

module.exports = router;
