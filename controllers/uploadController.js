const User = require('../models/User');

exports.uploadDocument = async (req, res) => {
  const user = await User.findById(req.user.id);

  user.fasDocument = req.file.filename;
  user.verificationStatus = 'Pending';

  await user.save();

  res.json({
    message: 'Document uploaded successfully',
  });
};
