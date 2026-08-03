// Amir
const express = require('express');
const { register, login, getProfile, getAllUsers, deleteUser, updateUserRoles } = require('../controllers/authControllers');
const auth = require('../middleware/authMiddleware');
const { admin } = auth;

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.get('/users', auth, admin, getAllUsers);
router.delete('/users/:userId', auth, admin, deleteUser);
router.patch('/users/:userId/roles', auth, admin, updateUserRoles);

module.exports = router;
