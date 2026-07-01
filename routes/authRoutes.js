// Maps authentication-related endpoints to the controller functions.
const express = require('express');
const { register, login, getProfile, promoteToAdmin } = require('../controllers/authControllers');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = authMiddleware;

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/promote/:userId', authMiddleware, adminMiddleware, promoteToAdmin);

module.exports = router;
