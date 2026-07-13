const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({

    destination(req,file,cb){
        cb(null,'uploads/');
    },

    filename(req,file,cb){
        cb(null, Date.now() + "-" + file.originalname);
    }

});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, and PDF files are allowed'));
    }
};

module.exports = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
});