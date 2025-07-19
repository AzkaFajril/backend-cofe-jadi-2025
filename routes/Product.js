const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const adminController = require('../controllers/adminController');

// Endpoint publik: GET /products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil produk' });
  }
});

router.get('/categories', adminController.getAllCategories);

module.exports = router;
