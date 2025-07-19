const mongoose = require('mongoose');

const InplaceOrderSchema = new mongoose.Schema({
  tableNumber: String,
  customerName: String,
  paymentMethod: String,
  items: [
    {
      menuId: String,
      menuName: String,
      quantity: Number,
      price: Number
    }
  ],
  total: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InplaceOrder', InplaceOrderSchema);
