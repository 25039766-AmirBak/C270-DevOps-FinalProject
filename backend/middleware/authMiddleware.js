const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const admin = (req, res, next) => {
  // Use .includes() for arrays instead of !==
  if (!req.user.role.includes('Admin')) { 
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const verified = (req, res, next) => {
  const requiresVerification = ['Recipient', 'Volunteer'];
  
  // Check if any of the user's roles are in the requiresVerification array
  const needsVerification = req.user.role.some(role => requiresVerification.includes(role));
  
  if (needsVerification && req.user.verificationStatus !== 'Verified') {
    return res.status(403).json({ message: 'Account must be verified to access this resource' });
  }
  next();
};

module.exports = auth;
module.exports.admin = admin;
module.exports.verified = verified;
