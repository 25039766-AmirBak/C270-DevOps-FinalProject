const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware, requireVerifiedRecipient } = authMiddleware;
const upload = require('../middleware/upload');
const { uploadDocument } = require('../controllers/uploadController');
const User = require('../models/User');

router.post(
  '/upload',
  authMiddleware,
  upload.single('document'),
  uploadDocument
);

router.patch('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verificationStatus = status;
    await user.save();

    res.status(200).json({
      message: 'Verification status updated successfully',
      user: {
        id: user._id,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update verification status', error: error.message });
  }
});

router.post('/meal-request', authMiddleware, requireVerifiedRecipient, (req, res) => {
  res.status(200).json({
    message: 'Meal request accepted',
    user: {
      id: req.user._id,
      name: req.user.name,
      verificationStatus: req.user.verificationStatus,
    },
  });
});

module.exports = router;
