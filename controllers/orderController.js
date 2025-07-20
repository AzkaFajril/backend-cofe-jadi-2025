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

    // Mapping ulang items: ambil harga dari Product berdasarkan productId dan size
    const itemsWithPrice = await Promise.all(items.map(async (item) => {
      // Cari produk asli berdasarkan _id atau id
      const product = await Product.findOne({ $or: [{ _id: item.productId }, { id: item.productId }] });
      let price = product?.price;
      let foundSize = null;
      if (product?.sizes && item.size) {
        foundSize = product.sizes.find((s) => s.name.toLowerCase() === item.size.toLowerCase());
        price = foundSize ? foundSize.price : product.price;
      }
      // Log debug
      console.log('DEBUG ORDER ITEM:', { item, productId: item.productId, foundProduct: !!product, foundSize, price });
      return {
        ...item,
        price: price ?? 0,
      };
    }));

    const crypto = require('crypto');
    const orderId = crypto.randomBytes(3).toString('hex');
    const order = new Order({
      ...req.body,
      items: itemsWithPrice,
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
    
    console.log('updateOrderStatus called:', { id, status });
    
    // Validasi input
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }
    
    // Validasi status
    const validStatus = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    let order;
    // Cek apakah id adalah ObjectId valid
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findByIdAndUpdate(
      id,
      { status },
        { new: true, runValidators: false }
      );
    } else {
      // Jika bukan ObjectId, cari berdasarkan orderId
      order = await Order.findOneAndUpdate(
        { orderId: id },
        { status },
        { new: true, runValidators: false }
      );
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('Order status updated successfully:', { orderId: order.orderId, status: order.status });
    res.json(order);
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update statusPesanan (khusus pengiriman makanan/minuman)
exports.updateStatusPesanan = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusPesanan } = req.body;
    
    console.log('updateStatusPesanan called:', { id, statusPesanan });
    
    // Validasi input
    if (!statusPesanan) {
      return res.status(400).json({ error: 'statusPesanan is required' });
    }
    
    // Validasi statusPesanan
    const validStatusPesanan = ['belum_dikirim', 'sedang_diproses', 'sudah_dikirim', 'dibatalkan'];
    if (!validStatusPesanan.includes(statusPesanan)) {
      return res.status(400).json({ error: 'Invalid statusPesanan value' });
    }
    
    let order;
    // Cek apakah id adalah ObjectId valid
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findOneAndUpdate(
        { $or: [{ orderId: id }, { _id: id }] },
        { statusPesanan },
        { new: true, runValidators: false }
      );
    } else {
      // Jika bukan ObjectId, cari berdasarkan orderId
      order = await Order.findOneAndUpdate(
        { orderId: id },
        { statusPesanan },
        { new: true, runValidators: false }
      );
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('Order statusPesanan updated successfully:', { orderId: order.orderId, statusPesanan: order.statusPesanan });
    res.json(order);
  } catch (err) {
    console.error('updateStatusPesanan error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Controller untuk GET /statuspesanan
exports.getStatusPesanan = async (req, res) => {
  try {
    // Ambil semua order in-place
    const orders = await Order.find({
      $or: [
        { orderType: 'IN_PLACE' },
        { deliOption: 'in-place' }
      ]
    });
    // Map hanya field yang dibutuhkan
    const statusList = orders.map(order => ({
      orderId: order.orderId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      statusPesanan: order.statusPesanan,
      tableNumber: order.tableNumber || null,
      date: order.date || null
    }));
    res.json(statusList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Endpoint untuk mendapatkan daftar status pesanan unik
exports.getOrderStatuses = async (req, res) => {
  try {
    const statuses = await Order.distinct('status');
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Controller untuk kontrol status pesanan (statusPesanan dan status utama sekaligus)
exports.controlStatusPesanan = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusPesanan, status } = req.body;
    
    console.log('controlStatusPesanan called:', { id, statusPesanan, status });
    
    // Validasi input
    if (!statusPesanan) {
      return res.status(400).json({ error: 'statusPesanan is required' });
    }
    
    // Validasi statusPesanan
    const validStatusPesanan = ['belum_dikirim', 'sedang_diproses', 'sudah_dikirim', 'dibatalkan'];
    if (!validStatusPesanan.includes(statusPesanan)) {
      return res.status(400).json({ error: 'Invalid statusPesanan value' });
    }
    
    // Validasi status jika ada
    if (status) {
      const validStatus = ['pending', 'processing', 'completed', 'cancelled'];
      if (!validStatus.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
    }
    
    let order;
    const updateData = { statusPesanan };
    if (status) {
      updateData.status = status;
    }
    
    // Cek apakah id adalah ObjectId valid
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findOneAndUpdate(
        { $or: [{ orderId: id }, { _id: id }] },
        updateData,
        { new: true, runValidators: false }
      );
    } else {
      // Jika bukan ObjectId, cari berdasarkan orderId
      order = await Order.findOneAndUpdate(
        { orderId: id },
        updateData,
        { new: true, runValidators: false }
      );
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('Order updated successfully:', { orderId: order.orderId, statusPesanan: order.statusPesanan, status: order.status });
    res.json(order);
  } catch (err) {
    console.error('controlStatusPesanan error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Tambahkan fungsi untuk mendapatkan pickup orders
exports.getPickupOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { orderType: 'PICK_UP' },
        { deliOption: 'pickup' },
        { deliveryType: 'pickup' }
      ]
    }).sort({ date: -1 });
    
    console.log(`Found ${orders.length} pickup orders`);
    res.json(orders);
  } catch (err) {
    console.error('getPickupOrders error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Tambahkan fungsi untuk mendapatkan order dengan filter yang lebih fleksibel
exports.getOrdersWithFilter = async (req, res) => {
  try {
    const { 
      orderType, 
      paymentMethod, 
      status, 
      statusPesanan,
      limit = 50,
      page = 1 
    } = req.query;
    
    let query = {};
    
    // Filter berdasarkan orderType
    if (orderType) {
      query.$or = [
        { orderType: orderType.toUpperCase() },
        { deliOption: orderType.toLowerCase() },
        { deliveryType: orderType.toLowerCase() }
      ];
    }
    
    // Filter berdasarkan paymentMethod
    if (paymentMethod) {
      query.paymentMethod = { $regex: paymentMethod, $options: 'i' };
    }
    
    // Filter berdasarkan status
    if (status) {
      query.status = status;
    }
    
    // Filter berdasarkan statusPesanan
    if (statusPesanan) {
      query.statusPesanan = statusPesanan;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Order.countDocuments(query);
    
    console.log(`Found ${orders.length} orders with filter:`, query);
    
    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('getOrdersWithFilter error:', err);
    res.status(500).json({ error: err.message });
  }
};
