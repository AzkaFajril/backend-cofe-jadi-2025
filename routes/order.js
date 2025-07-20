const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// ===== GET ROUTES =====

// Semua order
router.get('/', orderController.getAllOrders);

// Hanya in-place order
router.get('/inplace', orderController.getInPlaceOrders);

// Hanya pickup order
router.get('/pickup', orderController.getPickupOrders);

// Order dengan filter fleksibel
router.get('/filter', orderController.getOrdersWithFilter);

// Status pesanan in-place (khusus)
router.get('/statuspesanan', orderController.getStatusPesanan);

// Endpoint untuk mendapatkan daftar status pesanan unik
router.get('/status-pesanan', orderController.getOrderStatuses);

// Order history user
router.get('/by-user', orderController.getOrdersByUser);

// Order by ID
router.get('/:id', orderController.getOrderById);

// ===== PUT ROUTES =====

// Update status order utama
router.put('/:id/status', orderController.updateOrderStatus);

// Update statusPesanan (khusus pengiriman makanan/minuman)
router.put('/:id/statuspesanan', orderController.updateStatusPesanan);

// Kontrol status pesanan (statusPesanan dan status utama sekaligus)
router.put('/:id/control-statuspesanan', orderController.controlStatusPesanan);

// ===== POST ROUTES =====

// Create new order
router.post('/', orderController.createOrder);

module.exports = router;
