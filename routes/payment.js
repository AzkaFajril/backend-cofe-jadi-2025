const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../Middleware/auth');

// Payment routes
router.post('/create-payment-intent', auth, paymentController.createPaymentIntent);
router.post('/create-order', auth, paymentController.createOrder);
router.put('/confirm-payment/:orderId', auth, paymentController.confirmPayment);
router.get('/orders', auth, paymentController.getUserOrders);
router.get('/orders/:orderId', auth, paymentController.getOrderById);
router.put('/orders/:orderId/cancel', auth, paymentController.cancelOrder);

// Stripe webhook (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

module.exports = router;
