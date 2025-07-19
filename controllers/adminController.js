const User = require('../models/User');
const Payment = require('../models/Payment');
const Product = require('../models/Product');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Get recent orders for dashboard
    const recentOrders = await Payment.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const order = await Payment.findByIdAndUpdate(
      orderId,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user has any orders
    const userOrders = await Payment.find({ userId });
    if (userOrders.length > 0) {
      return res.status(400).json({ error: 'Cannot delete user with existing orders' });
    }
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { name, email, role },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Product management methods
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    console.log('REQ BODY:', req.body);
    const { name, displayName, description, sizes, category, image, isAvailable } = req.body;
    // Validate required fields
    if (!name || !displayName || !description || !sizes || !Array.isArray(sizes) || sizes.length === 0 || !category) {
      return res.status(400).json({ error: 'All required fields must be provided, including sizes array' });
    }
    // Validate sizes
    for (const size of sizes) {
      if (!size.name || typeof size.price !== 'number' || size.price < 0) {
        return res.status(400).json({ error: 'Each size must have a name and a positive price' });
      }
    }
    // Validate category
    const validCategories = ['hotDrinks', 'coldDrinks', 'food', 'desserts', 'drink', 'eat', 'dessert'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category. Must be one of: ' + validCategories.join(', ') });
    }
    const product = new Product({
      name,
      displayName,
      description,
      sizes,
      category,
      image: image || '',
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('CREATE PRODUCT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = { ...req.body, updatedAt: Date.now() };
    // Validate sizes if provided
    if (updateData.sizes) {
      if (!Array.isArray(updateData.sizes) || updateData.sizes.length === 0) {
        return res.status(400).json({ error: 'Sizes must be a non-empty array' });
      }
      for (const size of updateData.sizes) {
        if (!size.name || typeof size.price !== 'number' || size.price < 0) {
          return res.status(400).json({ error: 'Each size must have a name and a positive price' });
        }
      }
    }
    const product = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ambil semua kategori unik dari produk
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



