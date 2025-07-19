const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
  size: String
});

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [orderItemSchema],
  totalAmount: Number,
  stripePaymentId: String,
  status: { type: String, default: 'pending', enum: ['pending', 'processing', 'completed', 'cancelled'] },
  paymentMethod: String,
  deliveryAddress: String,
  deliveryOption: { type: String, enum: ['delivery', 'pickup'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
