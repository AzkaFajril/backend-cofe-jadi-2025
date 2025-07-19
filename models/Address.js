const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // satu user satu alamat
  },
  fullAddress: {
    type: String,
    required: true,
    maxlength: 255
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Address', AddressSchema); 