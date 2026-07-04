const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { uploadDocument } = require('../controllers/uploadController');

router.post(
  '/upload',
  protect,
  upload.single('document'),
  uploadDocument
);
