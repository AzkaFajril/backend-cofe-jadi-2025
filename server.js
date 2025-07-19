const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const uploadRoutes = require('./routes/upload');
const cartRoutes = require('./routes/cart');
const productRoutes = require('./routes/product');
const inplaceOrderRoutes = require('./routes/inplaceOrder');
const orderRoutes = require('./routes/order');
const addressRoutes = require('./routes/address');
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/payment', paymentRoutes);
app.use('/payment', paymentRoutes);
app.use('/upload', uploadRoutes);
app.use('/cart', cartRoutes);
app.use('/products', productRoutes);
app.use('/api/inplace-order', inplaceOrderRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/address', addressRoutes);
app.use('/admin', require('./routes/admin'));


app.get('/', (req, res) => res.send('API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));