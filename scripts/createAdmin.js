const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coffee-shop');
    console.log('Connected to MongoDB');

    // Create admin user
    const adminUser = new User({
      googleId: 'admin-google-id',
      email: 'azkafajril473@gmail.com', // Replace with your admin email
      name: 'Admin User',
      picture: 'https://via.placeholder.com/150',
      role: 'admin'
    });

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Save admin user
    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser(); 