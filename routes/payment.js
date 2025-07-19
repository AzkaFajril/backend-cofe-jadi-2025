require('dotenv').config();
const express = require('express');
const router = express.Router();
const midtransClient = require('midtrans-client');
const Order = require('../models/Order');
const mongoose = require('mongoose');

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

router.post('/midtrans-token', async (req, res) => {
  const { orderId, grossAmount, customer, paymentType } = req.body;
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: customer.name,
      email: customer.email,
    },
    // Tambahkan baris berikut agar hanya DANA yang aktif jika paymentType === 'dana'
    ...(paymentType === 'dana' ? { enabled_payments: ['dana'] } : {}),
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint khusus untuk pembayaran DANA
router.post('/midtrans-token-dana', async (req, res) => {
  const { orderId, grossAmount, customer } = req.body;
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: customer.name,
      email: customer.email,
    },
    enabled_payments: ['dana'],
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint khusus untuk pembayaran GoPay
router.post('/midtrans-token-gopay', async (req, res) => {
  const { orderId, grossAmount, customer } = req.body;
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: customer.name,
      email: customer.email,
    },
    enabled_payments: ['gopay'],
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint khusus untuk pembayaran ShopeePay
router.post('/midtrans-token-shopeepay', async (req, res) => {
  const { orderId, grossAmount, customer } = req.body;
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: customer.name,
      email: customer.email,
    },
    enabled_payments: ['shopeepay'],
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/midtrans-callback', express.json(), async (req, res) => {
  const notification = req.body;
  console.log('MIDTRANS CALLBACK:', notification); // Log notifikasi masuk
  const orderId = notification.order_id;
  let newStatus = 'pending';
  if (notification.transaction_status === 'settlement') newStatus = 'completed';
  else if (notification.transaction_status === 'pending') newStatus = 'pending';
  else if (['cancel', 'deny', 'expire', 'refund'].includes(notification.transaction_status)) newStatus = 'cancelled';
  else if (notification.transaction_status === 'capture') newStatus = 'processing';

  const paymentChannel = notification.payment_type;

  try {
    // Cari order baik dengan orderId (string pendek) maupun _id (jika ada)
    let updated = await Order.findOneAndUpdate(
      { orderId },
      { status: newStatus, paymentMethod: paymentChannel },
      { new: true }
    );
    if (!updated && mongoose.Types.ObjectId.isValid(orderId)) {
      updated = await Order.findOneAndUpdate(
        { _id: orderId },
        { status: newStatus, paymentMethod: paymentChannel },
        { new: true }
      );
    }
    if (!updated) {
      // Log semua orderId yang ada di database untuk debugging
      const allOrders = await Order.find({}, 'orderId _id status');
      console.error('Order not found for orderId:', orderId, 'All orderIds:', allOrders.map(o => o.orderId));
      return res.status(404).send('Order not found');
    }
    console.log('Order updated:', updated);
    res.status(200).send('OK');
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).send('Failed to update order status');
  }
});

module.exports = router;
