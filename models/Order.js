const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  size: String,
  quantity: Number,
  price: Number,
});

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  orderId: { type: String, required: true, unique: true },
  tableNumber: String, // untuk in place
  customer: {
    id: String,
    name: String,
    phone: String,
    address: String, // alamat pengiriman untuk delivery
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  items: [OrderItemSchema],
  deliOption: String, // 'in-place', 'delivery', 'pick-up'
  deliveryType: String, // 'in-place', 'delivery', 'pickup'
  paymentMethod: String,
  totalPayment: Number,
  totalAmount: Number, // alias untuk totalPayment
  date: { type: Date, default: Date.now },
  image: String,
  orderType: String, // 'IN_PLACE', 'DELIVER', 'PICK_UP'
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  statusPesanan: {
    type: String,
    enum: ['belum_dikirim', 'sedang_diproses', 'sudah_dikirim', 'dibatalkan'],
    default: 'belum_dikirim'
  },
  address: String, // alamat pengiriman
}, {
  timestamps: true // menambahkan createdAt dan updatedAt
});

module.exports = mongoose.model('Order', OrderSchema);
