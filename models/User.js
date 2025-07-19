const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: String,
  picture: String,
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
}, {
  timestamps: true // otomatis menambah createdAt dan updatedAt
});

module.exports = mongoose.model('User', UserSchema);
