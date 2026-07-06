const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { admin } = auth;
const upload = require('../middleware/upload');
const { uploadDocument } = require('../controllers/uploadController');
const User = require('../models/User');

router.post('/upload', auth, upload.single('document'), uploadDocument);

router.get('/pending', auth, admin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ verificationStatus: 'Pending' }).select(
      'name email verificationStatus document'
    );
    res.status(200).json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending verifications', error: error.message });
  }
});

router.patch('/:id', auth, admin, async (req, res) => {
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
      message: `Verification status updated to ${status}`,
      user: { id: user._id, verificationStatus: user.verificationStatus },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update verification status', error: error.message });
  }
});

module.exports = router;
