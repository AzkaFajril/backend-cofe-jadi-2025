const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const User = require('../models/User');

// Create payment intent for Stripe
exports.createPaymentIntent = async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe uses cents
      currency: 'usd',
      metadata: { userId: req.user._id.toString() }
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create order with payment details
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      paymentMethod,
      deliveryAddress,
      deliveryOption
    } = req.body;

    let userId = req.user._id;
    if (!userId && req.user.email) {
      // Cari user dari email jika _id tidak ada di token
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }
      userId = user._id;
    }
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    const order = await Payment.create({
      userId,
      items,
      totalAmount,
      paymentMethod,
      deliveryAddress,
      deliveryOption,
      status: 'completed' // AUTO PAYMENT LANGSUNG COMPLETED
    });

    // Populate user details
    await order.populate('userId', 'name email');

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Confirm payment (for non-Stripe payments like cash, KBZ Pay, etc.)
exports.confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Payment.findByIdAndUpdate(
      orderId,
      { 
        status: status || 'completed',
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's order history
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get specific order details
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Payment.findById(orderId)
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Payment.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only allow cancellation if order is still pending
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    order.status = 'cancelled';
    order.updatedAt = Date.now();
    await order.save();

    await order.populate('userId', 'name email');
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Webhook for Stripe payment confirmation
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Update order status to completed
    await Payment.findOneAndUpdate(
      { stripePaymentId: paymentIntent.id },
      { 
        status: 'completed',
        updatedAt: Date.now()
      }
    );
  }

  res.json({ received: true });
};