const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function makeUserAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coffee-shop');
    console.log('Connected to MongoDB');

    const email = 'azkafajril473@gmail.com'; // Replace with your email

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found. Creating new admin user...');
      const newAdmin = new User({
        googleId: 'admin-google-id',
        email: email,
        name: 'Admin User',
        picture: 'https://via.placeholder.com/150',
        role: 'admin'
      });
      await newAdmin.save();
      console.log('Admin user created successfully');
    } else {
      console.log('User found. Updating role to admin...');
      user.role = 'admin';
      await user.save();
      console.log('User role updated to admin successfully');
    }

    console.log('Email:', email);
    console.log('Role: admin');

  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

makeUserAdmin(); 