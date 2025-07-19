const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Semua order
router.get('/', orderController.getAllOrders);

// Hanya in-place order
router.get('/inplace', orderController.getInPlaceOrders);

// Endpoint lain (create, get by id, dsb)
router.post('/', orderController.createOrder);
router.get('/by-user', orderController.getOrdersByUser); // <-- ini harus di atas!
router.get('/:id', orderController.getOrderById);

module.exports = router;
