const mongoose = require('mongoose');
const crypto = require('crypto'); // import di atas file

const OrderItemSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  size: String,
  quantity: Number,
  price: Number,
});

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // <-- Tambahkan ini
  orderId: { type: String, required: true, unique: true },
  tableNumber: String, // untuk in place
  customer: {
    id: String,
    name: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  items: [OrderItemSchema],
  deliOption: String, // 'in-place', 'delivery', 'pick-up'
  paymentMethod: String,
  totalPayment: Number,
  date: String,
  image: String,
  orderType: String, // 'IN_PLACE', 'DELIVER', 'PICK_UP'
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
});

module.exports = mongoose.model('Order', OrderSchema);

exports.createOrder = async (req, res) => {
  try {
    // ...proses lain...

    // Generate orderId pendek (6 karakter hex)
    const orderId = crypto.randomBytes(3).toString('hex'); // hasil: 'a1b2c3'

    // Buat order baru
    const order = new Order({
      ...req.body,
      orderId, // simpan orderId pendek
    });

    await order.save();
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
