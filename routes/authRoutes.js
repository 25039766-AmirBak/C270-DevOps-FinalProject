const express = require('express');
const { register, login, getProfile, promoteToAdmin } = require('../controllers/authControllers');
const auth = require('../middleware/authMiddleware');
const { admin } = auth;

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/promote/:userId', auth, admin, promoteToAdmin);

module.exports = router;
