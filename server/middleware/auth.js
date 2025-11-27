const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Extract token from Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token using JWT secret
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user data to the request object
    req.user = verified;

    console.log('Decoded JWT user:', req.user); // Log to ensure the user data is attached

    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
