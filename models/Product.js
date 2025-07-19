const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  displayName: { type: String, required: true },
  description: { type: String, required: true },
  sizes: { type: [sizeSchema], required: true },
  category: { type: String, enum: ['hotDrinks', 'coldDrinks', 'food', 'desserts', 'drink', 'eat', 'dessert'], required: true },
  image: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);    