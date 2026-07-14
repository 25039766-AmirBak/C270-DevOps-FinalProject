const User = require('../models/Users');

// Upload document for user verification. Set verification to 'Pending'
exports.uploadDocument = async (req, res) => {
  try {
    // Find user by ID from authMiddleware & update document and verificationStatus
    const user = await User.findById(req.user.id);
    user.document = req.file.filename;
    user.verificationStatus = 'Pending';
    await user.save();
    res.json({ message: 'Document uploaded successfully', verificationStatus: 'Pending' });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};
