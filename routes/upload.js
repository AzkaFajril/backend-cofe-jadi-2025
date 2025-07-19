const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../Middleware/auth');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Upload routes
router.post('/image', auth, upload.single('image'), uploadController.uploadImage);
router.post('/file', auth, upload.single('file'), uploadController.uploadFile);

module.exports = router;
