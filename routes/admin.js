const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../Middleware/auth');
const isAdmin = require('../Middleware/isAdmin');
const orderController = require('../controllers/orderController');

// Admin routes - require both auth and admin role
router.get('/dashboard', auth, isAdmin, adminController.getDashboardStats);
router.get('/users', auth, isAdmin, adminController.getAllUsers);
router.get('/payments', auth, isAdmin, adminController.getAllPayments);
router.delete('/users/:userId', auth, isAdmin, adminController.deleteUser);
router.put('/users/:userId', auth, isAdmin, adminController.updateUser);

// Add admin verify endpoint
router.get('/verify', auth, isAdmin, (req, res) => {
  res.json({ isAdmin: true });
});

// Product management routes
router.get('/products', auth, isAdmin, adminController.getAllProducts);
router.post('/products', auth, isAdmin, adminController.createProduct);
router.put('/products/:productId', auth, isAdmin, adminController.updateProduct);
router.post('/products', auth, isAdmin, adminController.createProduct);
router.delete('/products/:productId', auth, isAdmin, adminController.deleteProduct);

// INI YANG BENAR! (pakai orderController, dengan auth & isAdmin)
router.put('/orders/:id/status', auth, isAdmin, orderController.updateOrderStatus);

module.exports = router;



