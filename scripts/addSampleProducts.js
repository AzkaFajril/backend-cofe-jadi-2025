const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const sampleProducts = [
  // Drink category
  {
    name: 'iced-latte',
    displayName: 'Iced Latte',
    description: 'Smooth espresso with cold milk and ice',
    price: 4.50,
    category: 'drink',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400',
    isAvailable: true
  },
  {
    name: 'hot-cappuccino',
    displayName: 'Hot Cappuccino',
    description: 'Classic Italian coffee with steamed milk foam',
    price: 3.75,
    category: 'drink',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a64e546?w=400',
    isAvailable: true
  },
  
  // Eat category
  {
    name: 'croissant',
    displayName: 'Butter Croissant',
    description: 'Flaky, buttery French pastry',
    price: 2.50,
    category: 'eat',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    isAvailable: true
  },
  {
    name: 'sandwich',
    displayName: 'Ham & Cheese Sandwich',
    description: 'Fresh bread with ham, cheese, and vegetables',
    price: 6.00,
    category: 'eat',
    image: 'https://images.unsplash.com/photo-1528735602786-469c5b9f3026?w=400',
    isAvailable: true
  },
  
  // Dessert category
  {
    name: 'chocolate-cake',
    displayName: 'Chocolate Cake',
    description: 'Rich chocolate cake with chocolate frosting',
    price: 5.50,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    isAvailable: true
  },
  {
    name: 'tiramisu',
    displayName: 'Tiramisu',
    description: 'Italian dessert with coffee-flavored mascarpone',
    price: 6.50,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    isAvailable: true
  }
];

async function addSampleProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing products (optional)
    // await Product.deleteMany({});
    // console.log('Cleared existing products');

    // Add sample products
    for (const product of sampleProducts) {
      const existingProduct = await Product.findOne({ name: product.name });
      if (!existingProduct) {
        await Product.create(product);
        console.log(`Added product: ${product.displayName}`);
      } else {
        console.log(`Product already exists: ${product.displayName}`);
      }
    }

    console.log('Sample products added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample products:', error);
    process.exit(1);
  }
}

addSampleProducts(); 