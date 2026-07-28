const User = require('../models/Users');

exports.uploadDocument = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.document = req.file.filename;
    user.verificationStatus = 'Pending';
    await user.save();
    res.json({ message: 'Document uploaded successfully', verificationStatus: 'Pending' });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};
