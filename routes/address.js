const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

// Simpan/update alamat user
router.post('/', addressController.saveAddress);
// Ambil alamat user berdasarkan userId
router.get('/:userId', addressController.getAddressByUserId);

module.exports = router; 