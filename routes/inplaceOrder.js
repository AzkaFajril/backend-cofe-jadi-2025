const express = require('express');
const router = express.Router();
const inplaceOrderController = require('../controllers/inplaceOrderController');

router.post('/', inplaceOrderController.createInplaceOrder);
router.get('/', inplaceOrderController.getAllInplaceOrders);

module.exports = router;
