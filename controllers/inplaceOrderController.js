const InplaceOrder = require('../models/InplaceOrder');

exports.createInplaceOrder = async (req, res) => {
  try {
    const { tableNumber, customerName, paymentMethod, items, total } = req.body;
    const order = await InplaceOrder.create({ tableNumber, customerName, paymentMethod, items, total });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllInplaceOrders = async (req, res) => {
  try {
    const orders = await InplaceOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
