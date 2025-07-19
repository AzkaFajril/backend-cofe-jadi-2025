const Order = require('../models/Order');
const Product = require('../models/Product'); // pastikan sudah di-import
const mongoose = require('mongoose');

exports.createOrder = async (req, res) => {
  try {
    const { userId, items, paymentMethod, totalPayment } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, message: 'items is required' });
    if (!paymentMethod) return res.status(400).json({ success: false, message: 'paymentMethod is required' });
    if (!totalPayment) return res.status(400).json({ success: false, message: 'totalPayment is required' });

    const crypto = require('crypto');
    const orderId = crypto.randomBytes(3).toString('hex');
    const order = new Order({
      ...req.body,
      orderId,
    });
    await order.save();
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    // Mapping deliveryType dari orderType/deliOption
    let deliveryType = order.orderType || order.deliOption || '';
    // Jika ingin label lebih ramah user
    if (deliveryType === 'IN_PLACE' || deliveryType === 'in-place') deliveryType = 'in place';
    else if (deliveryType === 'DELIVER' || deliveryType === 'delivery') deliveryType = 'delivery';
    else if (deliveryType === 'PICK_UP' || deliveryType === 'pick-up') deliveryType = 'self pick-up';
    res.json({ ...order.toObject(), deliveryType });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Semua order
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Hanya in-place order (TAMBAHKAN INI)
exports.getInPlaceOrders = async (req, res) => {
  try {
    // Ganti 'orderType' atau 'deliOption' sesuai field di database kamu
    const orders = await Order.find({
      $or: [
        { orderType: 'IN_PLACE' },
        { deliOption: 'in-place' }
      ]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Endpoint untuk ambil order history user
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.json([]);
    let query = { userId };
    // Tambahkan pengecekan tipe:
    if (mongoose.Types.ObjectId.isValid(userId)) {
      // Cek apakah userId di database bertipe ObjectId
      query = { userId: userId };
      // Jika di database userId bertipe ObjectId, gunakan baris ini:
      // query = { userId: mongoose.Types.ObjectId(userId) };
    }
    const orders = await Order.find(query).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error('getOrdersByUser error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update status order
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
