const jwt = require('jsonwebtoken');
const User = require('../models/Users');

// Use .env file for JWT secret key, with a fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Middleware to autheticate user based on JWT token
const auth = async (req, res, next) => {

  //Check for authorization header and ensure it starts with 'Bearer'
  const authHeader = req.headers.authorization;

  // If no authorization bearer or it doesn't start with 'Bearer', return 401 Unauthorized
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  //Extract token from authorization header and verify it with JWT_SECRET.
  //If valid, find user by ID from decoded token payload.
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    //  If user not found, return 401 Unauthorized.
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    //If user found, attach user to request object and call next() to proceed to the next middleware or route handler.
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is Admin
const admin = (req, res, next) => {
  // Use .includes() for arrays instead of !==
  if (!req.user.role.includes('Admin')) { 
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Middleware to check if user is verified
const verified = (req, res, next) => {
  const requiresVerification = ['Recipient', 'Volunteer'];
  
  // Check if any of the user's roles are in the requiresVerification array, previously created
  const needsVerification = req.user.role.some(role => requiresVerification.includes(role));
  
  // If user has a role that requires verification and their verificationStatus is not 'Verified', return 403 Forbidden
  if (needsVerification && req.user.verificationStatus !== 'Verified') {
    return res.status(403).json({ message: 'Account must be verified to access this resource' });
  }
  next();
};

module.exports = auth;
module.exports.admin = admin;
module.exports.verified = verified;
