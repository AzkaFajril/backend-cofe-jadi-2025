require('dotenv').config();
const express = require('express');
const router = express.Router();
const midtransClient = require('midtrans-client');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// POST /api/payment/midtrans-token
router.post('/midtrans-token', async (req, res) => {
  try {
    const { orderId, grossAmount, customer, finish_redirect_url } = req.body;

    // Inisialisasi Snap Midtrans
    const snap = new midtransClient.Snap({
      isProduction: false, // Ganti true jika sudah production
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    // Parameter transaksi
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
      customer_details: customer,
      callbacks: {
        finish: finish_redirect_url || 'https://cofeshopbandung.netlify.app/payment-success'
      }
    };

    // Buat transaksi Snap
    const transaction = await snap.createTransaction(parameter);

    // Kirim token ke frontend
    res.json({ token: transaction.token });
  } catch (error) {
    console.error('Midtrans error:', error);
    res.status(500).json({ error: 'Gagal membuat token Midtrans' });
  }
});

// Endpoint callback dari Midtrans
router.post('/midtrans-callback', express.json(), async (req, res) => {
  const notification = req.body;
  console.log('MIDTRANS CALLBACK:', notification); // Log notifikasi masuk
  const orderId = notification.order_id;
  let newStatus = 'pending';
  if (notification.transaction_status === 'settlement') newStatus = 'completed';
  else if (notification.transaction_status === 'pending') newStatus = 'pending';
  else if (["cancel", "deny", "expire", "refund"].includes(notification.transaction_status)) newStatus = 'cancelled';
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
