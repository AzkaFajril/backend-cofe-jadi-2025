require('dotenv').config();
const express = require('express');
const router = express.Router();
const midtransClient = require('midtrans-client');

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

module.exports = router;
