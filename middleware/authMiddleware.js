// Verifies JWTs and protects routes that require authentication or admin access.
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const isAdminRole = (role) => role === 'admin' || role === 'Admin';

const adminMiddleware = (req, res, next) => {
  if (!isAdminRole(req.user?.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const requireVerifiedRecipient = (req, res, next) => {
  if (req.user?.role && req.user.role.toLowerCase() !== 'recipient') {
    return next();
  }

  if (req.user?.verificationStatus !== 'Verified') {
    return res.status(403).json({ message: 'Recipient has not been verified.' });
  }

  next();
};

module.exports = authMiddleware;
module.exports.adminMiddleware = adminMiddleware;
module.exports.protect = authMiddleware;
module.exports.requireVerifiedRecipient = requireVerifiedRecipient;
