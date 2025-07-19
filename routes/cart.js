const express = require('express');
const router = express.Router();
const auth = require('../Middleware/auth');
const Cart = require('../models/Cart');

// Tambah item ke cart user
router.post('/add', auth, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }
  const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }
  await cart.save();
  await cart.populate('items.productId');
  res.json(cart);
});

// Ambil cart user
router.get('/', auth, async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  res.json(cart || { userId, items: [] });
});

// Hapus satu item dari cart user
router.delete('/remove', auth, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }
  cart.items = cart.items.filter(item => item.productId.toString() !== productId);
  await cart.save();
  await cart.populate('items.productId');
  res.json(cart);
});

// Update quantity satu item di cart user
router.put('/update', auth, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;
  let cart = await Cart.findOne({ userId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const item = cart.items.find(item => item.productId.toString() === productId);
  if (item) {
    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.productId');
    return res.json(cart);
  } else {
    return res.status(404).json({ message: 'Item not found in cart' });
  }
});

module.exports = router;